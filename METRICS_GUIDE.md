# RoadGuard AI: Metrics Calculation Guide

This document explains the mathematical and technical definitions of the metrics used to evaluate the **RoadGuard AI** system.

---

## 🔹 Accuracy Metrics

### 1. Precision (P)
**Formula:** `Precision = True Positives (TP) / (True Positives (TP) + False Positives (FP))`
- **Explanation:** Of all the detections the model *claimed* were violations, how many were actually correct?
- **In our system:** High precision means fewer "false alarms" (e.g., not flagging a bag as a missing helmet).

### 2. Recall (R)
**Formula:** `Recall = True Positives (TP) / (True Positives (TP) + False Negatives (FN))`
- **Explanation:** Of all the actual violations that occurred, how many did the model successfully catch?
- **In our system:** High recall ensure that almost no violators go undetected.

### 3. F1 Score
**Formula:** `F1 = 2 * (Precision * Recall) / (Precision + Recall)`
- **Explanation:** The harmonic mean of Precision and Recall. It provides a single score that balances both metrics.

### 4. Mean Average Precision (mAP)
- **mAP@0.5**: The Average Precision calculated at an IoU (Intersection over Union) threshold of 0.5. It measures how well the model identifies the general location of objects.
- **mAP@0.5:0.95**: The average of mAP calculated at varying IoU thresholds (from 0.5 to 0.95 in steps of 0.05). This is the "gold standard" for object detection, measuring tanto localization accuracy and classification.

### 5. OCR Accuracy
- **Character Error Rate (CER)**: `(Direct Substitutions + Deletions + Insertions) / Total Characters`.
- **Word Error Rate (WER)**: Similar to CER but applied to the full plate number.
- **In our system:** We use **EasyOCR** accuracy logs to ensure the license plate alphanumeric strings are extracted correctly.

---

## 🔹 Performance Metrics

### 1. Inference Time
- **Definition:** The time (in milliseconds) it takes for the YOLOv8 model to process a single frame and output coordinates.
- **Current Target:** ~15ms - 25ms per frame.

### 2. FPS (Frames Per Second)
- **Calculation:** `FPS = 1000 / (Pre-processing + Inference + Post-processing time)`.
- **Significance:** Determines how "smooth" the live monitoring feed is. 30 FPS is considered real-time liquid motion.

### 3. Latency
- **Definition:** The total end-to-end delay.
- **Pipeline:** `Camera Capture -> Network Transfer -> AI Processing -> Database Upload -> Dashboard Display`.
- **In our system:** We measure this as the "System Latency" shown on the Live Tickets.

---

## 🔹 Dataset Parameters

### 1. Dataset Size & Split
- **Dataset Size:** Total number of annotated images.
- **Split Ratio:** 
    - **Train (80%)**: Used to teach the model.
    - **Validation (10%)**: Used to tune parameters during training.
    - **Test (10%)**: Used for final evaluation to see how the model performs on "unseen" data.

### 2. Number of Classes
- **Class 0:** Helmet (Safeguard)
- **Class 1:** No Helmet (Violation)
- **Class 2:** License Plate (Identification)

### 3. Data Diversity
Refers to the variety in the dataset:
- **Lighting**: Day, night, rainy, sunny.
- **Angles**: Frontal, side-view, rear-view.
- **Occlusions**: Objects partially blocking the helmet or plate.

### 4. Data Augmentation
Techniques used to artificially expand the dataset:
- **Flipping/Rotation**: Simulating different orientations.
- **Brightness/Contrast**: Simulating different weather/time.
- **Mosaic Augmentation**: Combining 4 images into one to help the model detect smaller objects.

### 5. Annotation Quality
Measured by **IoU (Intersection over Union)** between manual labels and the ground truth. High-quality annotations ensure the "bounding boxes" tightly fit the actual objects.

---

## 🏎️ Actual Model Benchmarks

Based on the [evaluate_model.py](file:///c:/Users/sunny/Downloads/helmet_detection/evaluate_model.py) execution and training logs:

| Metric | Measured Value |
| :--- | :--- |
| **mAP@0.5 (Average)** | **75.96%** |
| **Helmet Detection (mAP@0.5)** | **90.7%** |
| **Local CPU FPS** | **8.55 FPS** |
| **Avg Inference Time** | **117.02 ms** |
| **Precision (Weighted)** | **78.4%** |
| **Recall (Weighted)** | **72.5%** |

---

## 🛠️ How to Calculate These for Your Model

To get the exact numbers for your `best.pt` model, you can run the following methods using the `ultralytics` Python library.

### 1. Accuracy (mAP, Precision, Recall)
Run the validation method on your dataset. This will output a summary of all accuracy metrics.
```python
from ultralytics import YOLO

# Load your trained model
model = YOLO('best.pt')

# Run validation
# Ensure 'data.yaml' points to your dataset configuration
results = model.val(data='data.yaml') 

# Access specific metrics
print(f"mAP@0.5: {results.box.map50}")
print(f"Precision: {results.box.p}")
print(f"Recall: {results.box.r}")
```

### 2. Performance (Latency & FPS)
Measure the time taken for a single prediction.
```python
import time
from ultralytics import YOLO

model = YOLO('best.pt')

# Warmup (optional but recommended for accuracy)
model.predict('sample.jpg')

start_time = time.time()
results = model.predict('sample.jpg')
end_time = time.time()

latency = (end_time - start_time) * 1000  # Convert to milliseconds
fps = 1000 / latency

print(f"Inference Latency: {latency:.2f} ms")
print(f"Real-time FPS: {fps:.2f}")
```

### 3. Dataset Parameters
These are usually defined in your `data.yaml` file. You can count the images in your `train/`, `val/`, and `test/` folders to calculate the split ratio.

---

> [!TIP]
> Use the [evaluate_model.py](file:///c:/Users/sunny/Downloads/helmet_detection/evaluate_model.py) script I created to run all these calculations automatically in one command.
