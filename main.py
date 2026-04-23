import cv2
from ultralytics import YOLO
import easyocr
import time
import os
from datetime import datetime
import threading
import re
import firebase_admin
from firebase_admin import credentials, firestore, storage
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import base64
import numpy as np

# -------------------- BASE DIRECTORY --------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -------------------- FIREBASE SETUP --------------------
try:
    cred_path = os.path.join(BASE_DIR, 'service_key.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'helmet-detection-7e07f.appspot.com'
    })
    db = firestore.client()
    bucket = storage.bucket()
    print(f"✅ Firebase initialized (Bucket: {bucket.name})")
except Exception as e:
    print("❌ Firebase Error:", e)
    db = None

# -------------------- FOLDERS --------------------
os.makedirs(os.path.join(BASE_DIR, "violation_images"), exist_ok=True)

# -------------------- LOAD MODELS --------------------
helmet_model_path = os.path.join(BASE_DIR, 'helmet_best.pt')
plate_model_path = os.path.join(BASE_DIR, 'numberplate_best.pt')

helmet_model = YOLO(helmet_model_path)
plate_model = YOLO(plate_model_path)

# -------------------- OCR --------------------
reader = easyocr.Reader(['en'])

# -------------------- FLASK --------------------
app = Flask(__name__)
CORS(app)

# -------------------- GLOBAL STATE --------------------
latest_frame = None
frame_lock = threading.Lock()
last_upload_time = 0
UPLOAD_COOLDOWN = 5

# -------------------- UTILS --------------------
print(f"DEBUG: Helmet Model Classes: {helmet_model.names}")
print(f"DEBUG: Plate Model Classes: {plate_model.names}")

def base64_to_cv2(b64_string):
    try:
        if not b64_string:
            return None
        if ';base64,' in b64_string:
            _, imgstr = b64_string.split(';base64,')
        else:
            imgstr = b64_string
        data = base64.b64decode(imgstr)
        np_arr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is not None:
             # Ensure correct shape for YOLO
             return img
        return None
    except Exception as e:
        print(f"DEBUG: Error decoding base64: {e}")
        return None

# -------------------- OCR FUNCTION --------------------
def extract_plate_text(plate_img):
    try:
        plate_img = cv2.resize(plate_img, None, fx=2, fy=2)
        gray = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5,5), 0)

        ocr = reader.readtext(gray)
        if ocr:
            text = ocr[0][1]
            if re.match(r'^[A-Z0-9]+$', text):
                return text
    except:
        pass
    return "UNKNOWN"

# -------------------- FIREBASE UPLOAD --------------------
def upload_to_firebase(file_path, data):
    if not db:
        return
    
    # 1. Try to upload image to Storage
    try:
        blob = bucket.blob(os.path.basename(file_path))
        blob.upload_from_filename(file_path)
        blob.make_public()
        data["image"] = blob.public_url
        print("✅ Image uploaded to Storage")
    except Exception as e:
        print(f"⚠️ Storage Skip (Upgrade Required): {e}")
        data["image"] = "" # No image, but we still want the data

    # 2. Always try to add to Firestore so metrics update
    try:
        db.collection("violations").add(data)
        print("✅ Violation data added to Firestore")
    except Exception as e:
        print("❌ Firestore Error:", e)

# -------------------- VIOLATION HANDLING --------------------
def handle_violation(frame, violation_detected, plate_number, latency_ms=0, confidence=0.9):
    global last_upload_time
    if violation_detected:
        current_time = time.time()
        if current_time - last_upload_time > UPLOAD_COOLDOWN:
            last_upload_time = current_time

            # Save local copy
            filename = f"violation_images/violator_{int(current_time)}.jpg"
            abs_filename = os.path.join(BASE_DIR, filename)
            cv2.imwrite(abs_filename, frame)

            # Metadata
            data = {
                "plate": plate_number,
                "time": str(datetime.now().isoformat()),
                "latency": latency_ms / 1000.0, # Convert to seconds
                "confidence": confidence,       # Now using real confidence (0-1)
                "violation": "No Helmet"
            }

            # Upload in background
            threading.Thread(
                target=upload_to_firebase,
                args=(abs_filename, data)
            ).start()
            print(f"🚨 Violation Uploaded: {plate_number}")
            return True
    return False

# -------------------- GLOBAL STATE --------------------
latest_frame = None
frame_lock = threading.Lock()

# -------------------- DETECTION CORE --------------------
def process_single_frame(frame):
    """Core logic to process a frame and return annotated image + detection data."""
    annotated = frame.copy()
    
    # ---------------- HELMET DETECTION ----------------
    start_all = time.time()
    helmet_results = helmet_model(frame, verbose=False)[0]
    t_helmet = (time.time() - start_all) * 1000

    violation_detected = False
    violation_conf = 0
    plate_number = "UNKNOWN"
    detections = []
    t_plate = 0
    t_ocr = 0

    for box in helmet_results.boxes:
        cls = int(box.cls[0])
        label = helmet_model.names[cls]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        if conf > 0.4:
            detections.append({
                "label": label,
                "conf": conf,
                "box": [x1, y1, x2, y2]
            })

        # 🚨 NO HELMET CONDITION (Lowered to 0.4 for testing)
        if label in ["Face and Hair", "Face and Hairs", "no-helmet"] and conf > 0.4:
            violation_detected = True
            violation_conf = conf
            rider_crop = frame[y1:y2, x1:x2]

            # ---------------- PLATE DETECTION ----------------
            if rider_crop.size > 0:
                s_plate = time.time()
                plate_results = plate_model(rider_crop, verbose=False)[0]
                t_plate = (time.time() - s_plate) * 1000

                for pbox in plate_results.boxes:
                    px1, py1, px2, py2 = map(int, pbox.xyxy[0])
                    plate_crop = rider_crop[py1:py2, px1:px2]

                    if plate_crop.size > 0:
                        # OCR (Only run if violation is confirmed to save time)
                        s_ocr = time.time()
                        plate_number = extract_plate_text(plate_crop)
                        t_ocr = (time.time() - s_ocr) * 1000
                        
                        detections.append({
                            "label": "Number Plate",
                            "conf": float(pbox.conf[0]),
                            "box": [x1+px1, y1+py1, x1+px2, y1+py2],
                            "plate": plate_number
                        })

                        cv2.putText(annotated, plate_number,
                                    (x1, y2+30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                                    (0,0,255), 2)
    
    total_t = (time.time() - start_all) * 1000
    print(f"⚡ Speed: {total_t:.1f}ms (Helmet: {t_helmet:.1f}ms | Plate: {t_plate:.1f}ms | OCR: {t_ocr:.1f}ms)")

    return annotated, detections, violation_detected, plate_number, total_t, violation_conf

# -------------------- MAIN PIPELINE --------------------
def camera_worker():
    global last_upload_time, latest_frame

    print("📸 Camera worker started...")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("⚠️ Warning: Could not open camera. (It might be used by the browser)")
        # We don't return here so the background thread stays alive for other logic if needed,
        # but the loop will handle the failure.
    
    while True:
        start_time = time.time()
        if not cap.isOpened():
            time.sleep(5) # Retry less frequently
            cap = cv2.VideoCapture(0)
            continue
            
        ret, frame = cap.read()
        if not ret:
            # print("❌ Failed to grab frame (Physical camera might be in use)")
            time.sleep(1)
            continue
            
        # ---------------- DETECTION ----------------
        annotated, detections, violation_detected, plate_number, latency, conf = process_single_frame(frame)

        # ---------------- VIOLATION HANDLING ----------------
        handle_violation(frame, violation_detected, plate_number, latency, conf)
        
        if violation_detected and (time.time() - last_upload_time < UPLOAD_COOLDOWN):
             cv2.putText(annotated, "WARNING: VIOLATION",
                        (50,80),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0,0,255), 3)

        # ---------------- FPS DISPLAY ----------------
        fps_val = time.time() - start_time
        if fps_val > 0:
            fps = int(1 / fps_val)
            cv2.putText(annotated, f"FPS: {fps}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                        (0,255,255), 2)

        # ---------------- UPDATE BUFFER ----------------
        with frame_lock:
            latest_frame = annotated.copy()

        # Control loop speed to prevent CPU saturation
        time.sleep(0.01)

def generate_frames():
    while True:
        with frame_lock:
            if latest_frame is None:
                time.sleep(0.1)
                continue
            
            ret, buffer = cv2.imencode('.jpg', latest_frame)
            if not ret:
                continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Stream at ~30 FPS
        time.sleep(0.03)

# -------------------- ROUTE --------------------
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/detect', methods=['POST'])
def detect_api():
    try:
        data = request.json
        image_b64 = data.get('image')
        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        frame = base64_to_cv2(image_b64)
        if frame is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Run inference
        _, detections, violation_detected, plate_number, latency, conf = process_single_frame(frame)
        
        # Handle violation (Upload to Firebase if detected)
        handle_violation(frame, violation_detected, plate_number, latency, conf)
        
        if detections:
            print(f"DEBUG: API detected {len(detections)} objects. Violation: {violation_detected}")
        
        return jsonify({
            "detections": detections,
            "violation": violation_detected,
            "plate": plate_number,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"DEBUG: API Error: {e}")
        return jsonify({"error": str(e)}), 500


# -------------------- RUN --------------------
if __name__ == "__main__":
    # Start the worker thread (DISABLED: Dashboard uses API/Browser Camera instead)
    # t = threading.Thread(target=camera_worker, daemon=True)
    # t.start()
    
    print("🚀 RoadGuard AI Backend Running on port 5000...")
    print("📹 Camera is active and monitoring automatically.")
    app.run(host="0.0.0.0", port=5000, threaded=True, use_reloader=False)