import cv2
from ultralytics import YOLO
import easyocr
import time
import json
import os
from datetime import datetime


# Load model
model = YOLO('best.pt')
reader = easyocr.Reader(['en'])

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # 🔥 Lower confidence for better detection
    results = model(frame, conf=0.3)

    annotated = results[0].plot()

    classes = []

    # Store plate boxes
    plate_boxes = []

    for box in results[0].boxes:
        cls = int(box.cls[0])
        classes.append(cls)

        # 🚗 If license plate detected (class 1)
        if cls == 1:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            plate_boxes.append((x1, y1, x2, y2))

    # 🚨 SMART LOGIC
    if 2 in classes:   # two_wheeler detected
        if 0 not in classes:   # helmet NOT detected
            print("🚨 No Helmet Detected!")

            filename = f"violators/violator_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)

            # 🔥 JSON SAVE START
            file = "violations.json"

            # Load old data
            if os.path.exists(file):
                with open(file, "r") as f:
                    data = json.load(f)
            else:
                data = []

            plate_number = "UNKNOWN"

            if plate_boxes:
                x1, y1, x2, y2 = plate_boxes[0]
                plate_img = frame[y1:y2, x1:x2]

                if plate_img.size != 0:
                    ocr = reader.readtext(plate_img)
                    if ocr:
                        plate_number = ocr[0][1]

            entry = {
                "plate": plate_number,
                "time": str(datetime.now()),
                "image": filename
            }

            data.append(entry)

            with open(file, "w") as f:
                json.dump(data, f, indent=4)

    # Show the frame
    cv2.imshow('Helmet Detection', annotated)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()