from ultralytics import YOLO
try:
    h = YOLO('helmet_best.pt')
    p = YOLO('numberplate_best.pt')
    print(f"Helmet: {h.names}")
    print(f"Plate: {p.names}")
except Exception as e:
    print(f"Error: {e}")
