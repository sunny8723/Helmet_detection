# Implementation Plan: Dual Models & UI Update

The objective is to update the RoadGuard AI system to use separate models for helmet detection and number plate recognition, and to update the landing page images.

## Proposed Changes

### 1. main.py (Backend)
- **Model Splitting**: Load `helmet_best.pt` and `numberplate_best.pt`.
- **Inference**: Run both models on每一帧.
- **Logic**: Use `helmet_best.pt` for helmet checks and `numberplate_best.pt` for license plate detection.

### 2. page.tsx (Frontend)
- **Image Update**: Replace `indian-road-1.jpg` references in the comparison section with `test4.png`.

## Open Questions
- **Class Indices**: Are `Helmet` and `Number Plate` both Class 0 in their respective new models?
