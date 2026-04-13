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
from flask import Flask, Response
from flask_cors import CORS

# -------------------- FIREBASE SETUP --------------------
try:
    cred = credentials.Certificate('service_key.json')
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'helmet-detection-7e07f.firebasestorage.app'
    })
    db = firestore.client()
    bucket = storage.bucket()
    print("✅ Firebase initialized")
except Exception as e:
    print("❌ Firebase Error:", e)
    db = None

# -------------------- FOLDERS --------------------
os.makedirs("violation_images", exist_ok=True)

# -------------------- LOAD MODELS --------------------
helmet_model = YOLO('helmet_best.pt')
plate_model = YOLO('numberplate_best.pt')

# -------------------- OCR --------------------
reader = easyocr.Reader(['en'])

# -------------------- CAMERA --------------------
cap = cv2.VideoCapture(0)

# -------------------- RATE LIMIT --------------------
last_upload_time = 0
UPLOAD_COOLDOWN = 5

# -------------------- FLASK --------------------
app = Flask(__name__)
CORS(app)

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
    try:
        blob = bucket.blob(file_path)
        blob.upload_from_filename(file_path)
        blob.make_public()
        data["image"] = blob.public_url
        db.collection("violations").add(data)
        print("✅ Uploaded to Firebase")
    except Exception as e:
        print("❌ Firebase Upload Error:", e)

# -------------------- MAIN PIPELINE --------------------
def generate_frames():
    global last_upload_time

    while True:
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            break

        annotated = frame.copy()

        # ---------------- HELMET DETECTION ----------------
        helmet_results = helmet_model(frame)[0]

        violation_detected = False
        plate_number = "UNKNOWN"

        for box in helmet_results.boxes:
            cls = int(box.cls[0])
            label = helmet_model.names[cls]
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Draw helmet box
            cv2.rectangle(annotated, (x1,y1), (x2,y2), (0,255,0), 2)
            cv2.putText(annotated, label, (x1,y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,0), 2)

            # 🚨 NO HELMET CONDITION (CHANGE IF NEEDED)
            if label == "Face and Hairs":
                violation_detected = True

                rider_crop = frame[y1:y2, x1:x2]

                # ---------------- PLATE DETECTION ----------------
                plate_results = plate_model(rider_crop)[0]

                for pbox in plate_results.boxes:
                    px1, py1, px2, py2 = map(int, pbox.xyxy[0])

                    plate_crop = rider_crop[py1:py2, px1:px2]

                    # Draw plate box
                    cv2.rectangle(annotated,
                                  (x1+px1, y1+py1),
                                  (x1+px2, y1+py2),
                                  (0,0,255), 2)

                    # OCR
                    plate_number = extract_plate_text(plate_crop)

                    cv2.putText(annotated, plate_number,
                                (x1, y2+30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                                (0,0,255), 2)

        # ---------------- VIOLATION HANDLING ----------------
        if violation_detected:
            current_time = time.time()

            if current_time - last_upload_time > UPLOAD_COOLDOWN:
                last_upload_time = current_time

                filename = f"violation_images/violator_{int(current_time)}.jpg"
                cv2.imwrite(filename, frame)

                latency = int((time.time() - start_time) * 1000)

                data = {
                    "plate": plate_number,
                    "time": str(datetime.now().isoformat()),
                    "latency": latency,
                    "confidence": 90,
                    "violation": "No Helmet"
                }

                threading.Thread(
                    target=upload_to_firebase,
                    args=(filename, data)
                ).start()

                print(f"🚨 Violation: {plate_number}")

            else:
                cv2.putText(annotated, "WARNING: VIOLATION",
                            (50,80),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1, (0,0,255), 3)

        # ---------------- FPS DISPLAY ----------------
        fps = int(1 / (time.time() - start_time))
        cv2.putText(annotated, f"FPS: {fps}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                    (0,255,255), 2)

        # ---------------- STREAM ----------------
        ret, buffer = cv2.imencode('.jpg', annotated)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# -------------------- ROUTE --------------------
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# -------------------- RUN --------------------
if __name__ == "__main__":
    print("🚀 RoadGuard AI Running on port 5000...")
    app.run(host="0.0.0.0", port=5000, threaded=True)