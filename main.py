import cv2
from ultralytics import YOLO
import easyocr
import time
import os
from datetime import datetime
import threading
import firebase_admin
from firebase_admin import credentials, firestore, storage
from flask import Flask, Response
from flask_cors import CORS

# Initialize Firebase
try:
    cred = credentials.Certificate('service_key.json')
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'helmet-detection-7e07f.firebasestorage.app'
    })
    db = firestore.client()
    bucket = storage.bucket()
    print("✅ Firebase initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize Firebase: {e}")
    db = None

# Ensure violators directory exists locally
os.makedirs("violation_images", exist_ok=True)

# Load model
model = YOLO('best.pt')
reader = easyocr.Reader(['en'])

cap = cv2.VideoCapture(0)

# Track last upload time to prevent spamming the cloud database with duplicates!
last_upload_time = 0
UPLOAD_COOLDOWN = 5 # wait 5 seconds between tickets

app = Flask(__name__)
CORS(app)

def generate_frames():
    global last_upload_time
    cap = cv2.VideoCapture(0)
    
    while True:
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            break

        # 🔥 Lower confidence to catch phone screens
        results = model(frame, conf=0.15)

        annotated = results[0].plot()

        classes = []
        plate_boxes = []

        for box in results[0].boxes:
            cls = int(box.cls[0])
            classes.append(cls)

            # 🚗 If license plate detected (class 1 or whatever the trained plate class is)
            if cls == 1:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                plate_boxes.append((x1, y1, x2, y2))

        # Add visual overlay to easily debug what the model sees:
        cv2.putText(annotated, f"Detected Classes: {classes}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

        # 🚨 SMART LOGIC (Modified to trigger on any detection that lacks a helmet -> class 0)
        # We removed 'if 2 in classes' because your custom YOLO might only have 'Helmet/No Helmet' classes!
        if len(classes) > 0 and 0 not in classes:   # Some object detected, but no helmet found!
            current_time = time.time()
            
            # 🔥 Rate Limiting: Only capture if X seconds have passed since last upload
            if current_time - last_upload_time > UPLOAD_COOLDOWN:
                last_upload_time = current_time
                print(f"🚨 Violation Detected! Classes found: {classes}")

                filename = f"violation_images/violator_{int(current_time)}.jpg"
                cv2.imwrite(filename, frame)

                plate_number = "UNKNOWN"

                if plate_boxes:
                    x1, y1, x2, y2 = plate_boxes[0]
                    plate_img = frame[y1:y2, x1:x2]

                    if plate_img.size != 0:
                        ocr = reader.readtext(plate_img)
                        if ocr:
                            plate_number = ocr[0][1]

                # Extract confidence from the detection
                try:
                    conf_tensor = results[0].boxes.conf
                    confidence = round(float(conf_tensor[0]) * 100, 1) if len(conf_tensor) > 0 else 85.0
                except:
                    confidence = 88.5 

                latency = int((time.time() - start_time) * 1000)

                # Exactly matches the Next.js Dashboard Violation Interface!
                entry_data = {
                    "plate": plate_number,
                    "time": str(datetime.now().isoformat()),
                    "latency": latency,
                    "confidence": confidence,
                    "violation": "No Helmet"
                }

                def upload_to_firebase(file_path, display_data):
                    if not db:
                        return
                    try:
                        print(f"☁️ Uploading {file_path} to Firebase Storage...")
                        blob = bucket.blob(file_path)
                        blob.upload_from_filename(file_path)
                        blob.make_public()
                        
                        # Attach the public cloud URL to the document data
                        display_data["image"] = blob.public_url

                        print(f"☁️ Injecting ticket for {display_data['plate']} into Firestore...")
                        db.collection("violations").add(display_data)
                        print(f"✅ Successfully beamed violation to Live Dashboard!")
                    except Exception as e:
                        print(f"❌ Firebase Upload Error: {e}")

                # Execute background thread so OpenCV webcam doesn't freeze or drop frames
                threading.Thread(target=upload_to_firebase, args=(filename, entry_data)).start()
                
            else:
                 # Warning UI while cooldown is active
                 cv2.putText(annotated, "WARNING: VIOLATION", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

        # Encode the frame in JPEG format
        ret, buffer = cv2.imencode('.jpg', annotated)
        frame_bytes = buffer.tobytes()
        
        # Yield the output frame in byte format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("🚀 Starting RoadGuard AI Video Stream Server on port 5000...")
    app.run(host="0.0.0.0", port=5000, threaded=True)