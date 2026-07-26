
import io
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO

NUTRIMENTS_TABLE = {
    "couscous":     {"calories":112,"proteines_g":3.8,"glucides_g":23.0,"lipides_g":0.6,"sel_g":0.0,"fibres_g":1.4},
    "tajine":       {"calories":185,"proteines_g":14.0,"glucides_g":12.0,"lipides_g":8.5,"sel_g":0.8,"fibres_g":2.5},
    "harira":       {"calories":95, "proteines_g":5.5,"glucides_g":13.0,"lipides_g":2.8,"sel_g":0.6,"fibres_g":3.2},
    "msemen":       {"calories":310,"proteines_g":8.0,"glucides_g":52.0,"lipides_g":9.0,"sel_g":0.9,"fibres_g":2.0},
    "bastilla":     {"calories":290,"proteines_g":16.0,"glucides_g":28.0,"lipides_g":13.0,"sel_g":1.1,"fibres_g":1.8},
    "pizza":        {"calories":266,"proteines_g":11.0,"glucides_g":33.0,"lipides_g":10.0,"sel_g":1.5,"fibres_g":2.3},
    "hamburger":    {"calories":295,"proteines_g":17.0,"glucides_g":24.0,"lipides_g":14.0,"sel_g":1.8,"fibres_g":1.5},
    "salad":        {"calories":20, "proteines_g":1.5,"glucides_g":3.0,"lipides_g":0.3,"sel_g":0.1,"fibres_g":1.8},
    "white_rice":   {"calories":130,"proteines_g":2.7,"glucides_g":28.0,"lipides_g":0.3,"sel_g":0.0,"fibres_g":0.4},
    "pasta":        {"calories":158,"proteines_g":5.8,"glucides_g":31.0,"lipides_g":0.9,"sel_g":0.0,"fibres_g":1.8},
    "lamb_chop":    {"calories":250,"proteines_g":26.0,"glucides_g":0.0,"lipides_g":16.0,"sel_g":0.9,"fibres_g":0.0},
    "nachos":       {"calories":346,"proteines_g":4.9,"glucides_g":44.0,"lipides_g":18.0,"sel_g":1.2,"fibres_g":3.5},
    "empanada":     {"calories":297,"proteines_g":10.0,"glucides_g":32.0,"lipides_g":14.0,"sel_g":0.8,"fibres_g":1.5},
    "pho":          {"calories":55, "proteines_g":4.5,"glucides_g":7.0,"lipides_g":1.2,"sel_g":1.1,"fibres_g":0.8},
    "tomato":       {"calories":18, "proteines_g":0.9,"glucides_g":3.9,"lipides_g":0.2,"sel_g":0.0,"fibres_g":1.2},
    "watermelon":   {"calories":30, "proteines_g":0.6,"glucides_g":7.6,"lipides_g":0.2,"sel_g":0.0,"fibres_g":0.4},
    "ice_cream":    {"calories":207,"proteines_g":3.5,"glucides_g":24.0,"lipides_g":11.0,"sel_g":0.1,"fibres_g":0.7},
    "sushi":        {"calories":143,"proteines_g":5.2,"glucides_g":28.0,"lipides_g":0.7,"sel_g":1.3,"fibres_g":0.6},
    "tofu":         {"calories":76, "proteines_g":8.0,"glucides_g":1.9,"lipides_g":4.8,"sel_g":0.1,"fibres_g":0.3},
    "falafel_wrap": {"calories":180,"proteines_g":6.0,"glucides_g":24.0,"lipides_g":7.0,"sel_g":0.6,"fibres_g":3.0},
    "bibimbap":     {"calories":180,"proteines_g":8.0,"glucides_g":27.0,"lipides_g":5.0,"sel_g":0.8,"fibres_g":2.5},
    "paella":       {"calories":196,"proteines_g":14.0,"glucides_g":23.0,"lipides_g":5.5,"sel_g":1.0,"fibres_g":1.5},
}

DENSITE = {
    "couscous":0.75,"tajine":0.90,"harira":0.85,"msemen":0.60,
    "white_rice":0.80,"pasta":0.85,"salad":0.30,"lamb_chop":1.05,
    "pizza":0.60,"hamburger":0.70,"pho":0.88,"tofu":0.95,
}

CLASS_NAMES = [
    "candy","egg_tart","french_fries","chocolate","biscuit","popcorn",
    "pudding","ice_cream","cheese_butter","cake","wine","milkshake",
    "coffee","smoothie","salmon","croissant","tuna","chicken_skewer",
    "waffle","lobster","mashed_potato","brownie","cheesecake","macaroon",
    "hot_dog","ramen","dumpling","oyster","hamburger","pizza","white_rice",
    "sausage","fried_rice","bread","steak","onion_rings","sushi",
    "spring_rolls","pork_chop","pasta","taco","fish_and_chips","crab",
    "grilled_salmon","peking_duck","lamb_chop","bibimbap","paella",
    "sashimi","falafel","hummus","baklava","moussaka","tzatziki",
    "shawarma","couscous","tajine","harira","msemen","bastilla",
    "apple","banana","orange","grape","strawberry","watermelon",
    "salad","soup","egg","tofu","mushroom","carrot","tomato","broccoli",
    "corn","avocado","potato","rice","noodle","bread_roll","sandwich",
    "burrito","quesadilla","nachos","enchilada","churros","empanada",
    "ceviche","pho","pad_thai","butter_chicken","naan","dosa","biryani",
    "samosa","falafel_wrap","kebab","meze","dolma","spanakopita",
    "souvlaki","tiramisu","gelato"
]

import os

class VisionAgent:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(__file__), "..", "models", "food_yolov8_best.pt"
            )
        self.model       = YOLO(model_path)
        self.class_names = CLASS_NAMES

    def analyze(self, image_bytes: bytes) -> dict:
        image        = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results      = self.model(image, conf=0.30, verbose=False)[0]
        img_w, img_h = image.size
        img_area     = img_w * img_h
        aliments     = []
        total        = {"calories":0,"proteines_g":0,"glucides_g":0,
                        "lipides_g":0,"sel_g":0,"fibres_g":0}

        for box in results.boxes:
            idx    = int(box.cls)
            classe = self.class_names[idx] if idx < len(self.class_names) else f"food_{idx}"
            conf   = float(box.conf)
            x1,y1,x2,y2 = box.xyxy[0].tolist()
            aire   = (x2-x1)*(y2-y1)
            ratio  = aire / img_area
            densite= DENSITE.get(classe, 0.85)
            poids  = round(ratio * 2000 * densite, 1)
            ref    = NUTRIMENTS_TABLE.get(classe, {
                "calories":150,"proteines_g":5.0,"glucides_g":20.0,
                "lipides_g":5.0,"sel_g":0.5,"fibres_g":2.0})
            f      = poids / 100.0
            nut    = {k: round(v*f,1) for k,v in ref.items()}
            for k in total:
                total[k] += nut.get(k,0)
            aliments.append({
                "nom":classe,"poids_g":poids,
                "confiance":round(conf,2),"nutriments":nut
            })

        return {
            "aliments":         aliments,
            "nutriments_repas": {k:round(v,1) for k,v in total.items()},
            "nb_aliments":      len(aliments)
        }
