import time
import os
from ultralytics import YOLO
import torch

def calculate_model_metrics(model_path='best.pt', data_yaml=None):
    """
    Calculates Accuracy and Performance metrics for the YOLOv8 model.
    """
    print(f"🚀 Loading model: {model_path}")
    model = YOLO(model_path)

    # 1. 🔹 ACCURACY METRICS
    if data_yaml and os.path.exists(data_yaml):
        print(f"📊 Running Validation on {data_yaml}...")
        results = model.val(data=data_yaml, imgsz=640, verbose=False)
        
        print("\n✅ --- Accuracy Results ---")
        print(f"mAP@0.5:       {results.box.map50:.4f}")
        print(f"mAP@0.5:0.95:  {results.box.map:.4f}")
        print(f"Precision:     {results.box.p[0]:.4f}")
        print(f"Recall:        {results.box.r[0]:.4f}")
        # F1 Score calculation
        p = results.box.p[0]
        r = results.box.r[0]
        f1 = 2 * (p * r) / (p + r) if (p + r) > 0 else 0
        print(f"F1 Score:      {f1:.4f}")
    else:
        print("\n⚠️ Skipping Accuracy Metrics: No data.yaml provided or path invalid.")

    # 2. 🔹 PERFORMANCE METRICS
    print("\n⚡ Measuring Performance...")
    # Warmup
    dummy_input = torch.zeros((1, 3, 640, 640))
    for _ in range(10):
        _ = model(dummy_input, verbose=False)

    # Benchmark Latency & FPS
    start_time = time.time()
    iterations = 50
    for _ in range(iterations):
        _ = model(dummy_input, verbose=False)
    
    total_time = (time.time() - start_time) * 1000 # ms
    avg_latency = total_time / iterations
    fps = 1000 / avg_latency

    print("\n✅ --- Performance Results ---")
    print(f"Avg Inference Time: {avg_latency:.2f} ms")
    print(f"Real-time FPS:      {fps:.2f}")
    print(f"Device:             {model.device}")

    # 3. 🔹 DATASET PARAMETERS (Static report from data.yaml)
    if data_yaml and os.path.exists(data_yaml):
        import yaml
        with open(data_yaml, 'r') as f:
            data = yaml.safe_load(f)
        
        print("\n✅ --- Dataset Parameters ---")
        print(f"Number of Classes: {data.get('nc')}")
        print(f"Class Names:       {data.get('names')}")
        print(f"Train Path:        {data.get('train')}")
        print(f"Val Path:          {data.get('val')}")

if __name__ == "__main__":
    # Change 'data.yaml' to your actual dataset config file path to see Accuracy metrics
    calculate_model_metrics(model_path='best.pt', data_yaml='data.yaml')
