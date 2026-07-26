"""
Kaggle Notebook: MFOOD-70 → YOLOv8 Moroccan Food Detector
=========================================================
Copy this entire file into a Kaggle Notebook cell and run.
"""

# ── 0. Auto-discover dataset path ──────────────────────────────────────────
import os
INPUT = "/kaggle/input"
print("=== Kaggle input structure ===")
for entry in sorted(os.listdir(INPUT)):
    path = os.path.join(INPUT, entry)
    if os.path.isdir(path):
        sub = os.listdir(path)
        print(f"  {entry}/  ({len(sub)} items)")
        for s in sub[:10]:
            sp = os.path.join(path, s)
            if os.path.isdir(sp):
                sub2 = os.listdir(sp)
                print(f"    {s}/  ({len(sub2)} subdirs)")
                for t in sub2[:5]:
                    tp = os.path.join(sp, t)
                    if os.path.isdir(tp):
                        print(f"      {t}/  ({len(os.listdir(tp))} files)")
                    else:
                        print(f"      {t}")
            else:
                print(f"    {s}")
        if len(sub) > 10:
            print(f"    ... ({len(sub)-10} more)")
print("=" * 40)

# Find the train folder
train_path = None
for root, dirs, files in os.walk(INPUT):
    for d in dirs:
        if d == "train":
            subdirs = [s for s in os.listdir(os.path.join(root, d))
                       if os.path.isdir(os.path.join(root, d, s))]
            if len(subdirs) > 10:
                train_path = os.path.join(root, d)
                break
    if train_path:
        break

if not train_path:
    raise FileNotFoundError("Could not find MFOOD train folder in /kaggle/input")

MFOOD_PATH = train_path
print(f"\nUsing MFOOD path: {MFOOD_PATH}")

# ── 1. Install/imports ──────────────────────────────────────────────────────
import shutil, yaml
from pathlib import Path
from collections import defaultdict
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from ultralytics import YOLO

# ── 2. Paths ────────────────────────────────────────────────────────────────
OUTPUT     = "/kaggle/working/mfood_yolo"
TRAIN_IMG  = f"{OUTPUT}/train/images"
TRAIN_LBL  = f"{OUTPUT}/train/labels"
VAL_IMG    = f"{OUTPUT}/valid/images"
VAL_LBL    = f"{OUTPUT}/valid/labels"
VAL_SPLIT  = 0.20
RANDOM_SEED = 42
IMG_SIZE    = 640
EPOCHS      = 150
BATCH       = 16

# ── 3. Valid image extensions ───────────────────────────────────────────────
VALID_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".jfif"}

# ── 4. Get sorted class list ────────────────────────────────────────────────
class_dirs = sorted([
    d for d in os.listdir(MFOOD_PATH)
    if os.path.isdir(os.path.join(MFOOD_PATH, d))
])
print(f"\nFound {len(class_dirs)} classes")
print(f"First 5: {class_dirs[:5]}")
print(f"Last 5: {class_dirs[-5:]}")

# ── 5. Collect images (dedup by stem) ───────────────────────────────────────
def collect_images(class_dirs):
    samples = []
    for cls_idx, cls_name in enumerate(class_dirs):
        cls_path = os.path.join(MFOOD_PATH, cls_name)
        seen_stems = set()
        for fname in sorted(os.listdir(cls_path)):
            stem, ext = os.path.splitext(fname)
            if ext.lower() not in VALID_EXTS:
                continue
            if stem in seen_stems:
                continue
            seen_stems.add(stem)
            samples.append((cls_idx, cls_name, os.path.join(cls_path, fname)))
    return samples

samples = collect_images(class_dirs)
print(f"Total unique images: {len(samples)}")

if len(samples) == 0:
    raise RuntimeError("No images found! Check dataset structure above.")

# Per-class stats
class_counts = defaultdict(int)
for cls_idx, cls_name, _ in samples:
    class_counts[cls_name] += 1

min_count = min(class_counts.values())
max_count = max(class_counts.values())
print(f"Images/class: min={min_count}, max={max_count}, mean={len(samples)//len(class_dirs):.0f}")

classes_under_10 = [c for c, n in class_counts.items() if n < 10]
if classes_under_10:
    print(f"Warning: {len(classes_under_10)} classes have <10 images: {classes_under_10}")

# ── 6. Stratified train/val split ───────────────────────────────────────────
train_samples, val_samples = train_test_split(
    samples, test_size=VAL_SPLIT, random_state=RANDOM_SEED,
    stratify=[s[0] for s in samples]
)
print(f"Train: {len(train_samples)}, Val: {len(val_samples)}")

# ── 7. Create YOLO directory structure ──────────────────────────────────────
for d in [TRAIN_IMG, TRAIN_LBL, VAL_IMG, VAL_LBL]:
    os.makedirs(d, exist_ok=True)

# ── 8. Write images + YOLO labels (full-image bounding boxes) ───────────────
def write_yolo(split_samples, img_dir, lbl_dir, split_name):
    for cls_idx, cls_name, img_path in split_samples:
        img = cv2.imread(img_path)
        if img is None:
            continue
        h, w = img.shape[:2]
        stem = Path(img_path).stem
        dst_img = f"{img_dir}/{stem}_{cls_idx}.jpg"
        dst_lbl = f"{lbl_dir}/{stem}_{cls_idx}.txt"

        cv2.imwrite(dst_img, img)

        cx = 0.5
        cy = 0.5
        bw = 0.99
        bh = 0.99
        with open(dst_lbl, "w") as f:
            f.write(f"{cls_idx} {cx} {cy} {bw} {bh}\n")
    print(f"{split_name}: {len(split_samples)} images written")

write_yolo(train_samples, TRAIN_IMG, TRAIN_LBL, "Train")
write_yolo(val_samples,   VAL_IMG,   VAL_LBL,   "Val")

# ── 9. Create data.yaml ─────────────────────────────────────────────────────
data_yaml = {
    "path": OUTPUT,
    "train": "train/images",
    "val": "valid/images",
    "nc": len(class_dirs),
    "names": class_dirs,
}
with open(f"{OUTPUT}/data.yaml", "w") as f:
    yaml.dump(data_yaml, f, default_flow_style=False)
print(f"data.yaml written with {len(class_dirs)} classes")

# ── 10. Train YOLOv8n from scratch ──────────────────────────────────────────
model = YOLO("yolov8n.pt")

import torch
device = 0 if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

results = model.train(
    data=f"{OUTPUT}/data.yaml",
    epochs=EPOCHS,
    imgsz=IMG_SIZE,
    batch=BATCH,
    patience=20,
    device=device,
    workers=4,
    project="/kaggle/working/runs",
    name="mfood_yolov8",
    exist_ok=True,
    pretrained=True,
    optimizer="AdamW",
    lr0=0.001,
    lrf=0.01,
    warmup_epochs=3,
    cos_lr=True,
    close_mosaic=10,
    augment=True,
    amp=True,
    val=True,
    save=True,
    save_period=10,
)

# ── 11. Copy best model to output ───────────────────────────────────────────
best_path = "/kaggle/working/runs/mfood_yolov8/weights/best.pt"
if os.path.exists(best_path):
    shutil.copy(best_path, "/kaggle/working/mfood_yolov8_best.pt")
    print(f"Model saved to /kaggle/working/mfood_yolov8_best.pt")
else:
    print("best.pt not found, checking last.pt...")
    last_path = "/kaggle/working/runs/mfood_yolov8/weights/last.pt"
    if os.path.exists(last_path):
        shutil.copy(last_path, "/kaggle/working/mfood_yolov8_best.pt")
        print(f"Model saved (last) to /kaggle/working/mfood_yolov8_best.pt")

print("\n✅ Done! Download /kaggle/working/mfood_yolov8_best.pt")
