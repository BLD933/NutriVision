
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

import os

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

MFOOD_TO_NUTRI = {
    "couscous":  NUTRIMENTS_TABLE["couscous"],
    "tajine":    NUTRIMENTS_TABLE["tajine"],
    "harira":    NUTRIMENTS_TABLE["harira"],
    "msemen":    NUTRIMENTS_TABLE["msemen"],
    "bastilla":  NUTRIMENTS_TABLE["bastilla"],
    "pizza":     NUTRIMENTS_TABLE["pizza"],
    "hamburger": NUTRIMENTS_TABLE["hamburger"],
    "white_rice":NUTRIMENTS_TABLE["white_rice"],
    "pasta":     NUTRIMENTS_TABLE["pasta"],
    "lamb_chop": NUTRIMENTS_TABLE["lamb_chop"],
    "salad":     NUTRIMENTS_TABLE["salad"],
    "ice_cream": NUTRIMENTS_TABLE["ice_cream"],
    "sushi":     NUTRIMENTS_TABLE["sushi"],
    "tofu":      NUTRIMENTS_TABLE["tofu"],
    "falafel_wrap":NUTRIMENTS_TABLE["falafel_wrap"],
    "bibimbap":  NUTRIMENTS_TABLE["bibimbap"],
    "paella":    NUTRIMENTS_TABLE["paella"],
    "pho":       NUTRIMENTS_TABLE["pho"],
    "tomato":    NUTRIMENTS_TABLE["tomato"],
    "watermelon":NUTRIMENTS_TABLE["watermelon"],
    "nachos":    NUTRIMENTS_TABLE["nachos"],
    "empanada":  NUTRIMENTS_TABLE["empanada"],
}

class VisionAgent:
    def __init__(self, model_path=None):
        mfood_path = os.path.join(
            os.path.dirname(__file__), "..", "models", "mfood_yolov8_best.pt"
        )
        self.MFOOD70_TO_NUTRI = {
            "couscous": {"calories":112,"proteines_g":3.8,"glucides_g":23.0,"lipides_g":0.6,"sel_g":0.0,"fibres_g":1.4},
            "harira": {"calories":95,"proteines_g":5.5,"glucides_g":13.0,"lipides_g":2.8,"sel_g":0.6,"fibres_g":3.2},
            "msamen": {"calories":310,"proteines_g":8.0,"glucides_g":52.0,"lipides_g":9.0,"sel_g":0.9,"fibres_g":2.0},
            "chicken basstila": {"calories":290,"proteines_g":16.0,"glucides_g":28.0,"lipides_g":13.0,"sel_g":1.1,"fibres_g":1.8},
            "fish basstila": {"calories":250,"proteines_g":14.0,"glucides_g":25.0,"lipides_g":10.0,"sel_g":1.0,"fibres_g":1.5},
            "pizza": {"calories":266,"proteines_g":11.0,"glucides_g":33.0,"lipides_g":10.0,"sel_g":1.5,"fibres_g":2.3},
            "hamburger": {"calories":295,"proteines_g":17.0,"glucides_g":24.0,"lipides_g":14.0,"sel_g":1.8,"fibres_g":1.5},
            "paella": {"calories":196,"proteines_g":14.0,"glucides_g":23.0,"lipides_g":5.5,"sel_g":1.0,"fibres_g":1.5},
            "apple": {"calories":52,"proteines_g":0.3,"glucides_g":14.0,"lipides_g":0.2,"sel_g":0.0,"fibres_g":2.4},
            "banana": {"calories":89,"proteines_g":1.1,"glucides_g":23.0,"lipides_g":0.3,"sel_g":0.0,"fibres_g":2.6},
            "orange": {"calories":47,"proteines_g":0.9,"glucides_g":12.0,"lipides_g":0.1,"sel_g":0.0,"fibres_g":2.4},
            "salmon": {"calories":208,"proteines_g":20.0,"glucides_g":0.0,"lipides_g":13.0,"sel_g":0.6,"fibres_g":0.0},
            "croissant": {"calories":406,"proteines_g":8.0,"glucides_g":46.0,"lipides_g":21.0,"sel_g":0.7,"fibres_g":2.6},
            "french fries": {"calories":312,"proteines_g":3.4,"glucides_g":38.0,"lipides_g":17.0,"sel_g":0.4,"fibres_g":3.2},
            "chocolate cake": {"calories":389,"proteines_g":4.0,"glucides_g":51.0,"lipides_g":20.0,"sel_g":0.4,"fibres_g":2.5},
            "omelette": {"calories":154,"proteines_g":11.0,"glucides_g":1.0,"lipides_g":12.0,"sel_g":0.4,"fibres_g":0.0},
            "spagetti": {"calories":158,"proteines_g":5.8,"glucides_g":31.0,"lipides_g":0.9,"sel_g":0.0,"fibres_g":1.8},
            "lasagne": {"calories":180,"proteines_g":8.0,"glucides_g":22.0,"lipides_g":7.0,"sel_g":0.8,"fibres_g":2.0},
            "chicken nuggets": {"calories":296,"proteines_g":14.0,"glucides_g":18.0,"lipides_g":19.0,"sel_g":1.0,"fibres_g":0.5},
            "caesar salad": {"calories":150,"proteines_g":7.0,"glucides_g":8.0,"lipides_g":10.0,"sel_g":0.7,"fibres_g":2.5},
            "roasted chicken": {"calories":239,"proteines_g":27.0,"glucides_g":0.0,"lipides_g":14.0,"sel_g":0.9,"fibres_g":0.0},
            "fried calamari": {"calories":175,"proteines_g":15.0,"glucides_g":10.0,"lipides_g":8.0,"sel_g":0.8,"fibres_g":0.0},
            "lentils": {"calories":116,"proteines_g":9.0,"glucides_g":20.0,"lipides_g":0.4,"sel_g":0.0,"fibres_g":8.0},
            "pear": {"calories":57,"proteines_g":0.4,"glucides_g":15.0,"lipides_g":0.1,"sel_g":0.0,"fibres_g":3.1},
            "dates": {"calories":282,"proteines_g":2.5,"glucides_g":75.0,"lipides_g":0.4,"sel_g":0.0,"fibres_g":8.0},
            "chicken with potatoes and olives": {"calories":220,"proteines_g":20.0,"glucides_g":15.0,"lipides_g":10.0,"sel_g":1.2,"fibres_g":2.0},
            "tagine with vegetables": {"calories":120,"proteines_g":3.0,"glucides_g":15.0,"lipides_g":6.0,"sel_g":0.7,"fibres_g":4.0},
            "tagine with beef": {"calories":185,"proteines_g":18.0,"glucides_g":8.0,"lipides_g":10.0,"sel_g":0.8,"fibres_g":2.0},
            "tagine with artichokes and peas": {"calories":140,"proteines_g":8.0,"glucides_g":16.0,"lipides_g":6.0,"sel_g":0.7,"fibres_g":5.0},
            "tagine with quince": {"calories":160,"proteines_g":10.0,"glucides_g":20.0,"lipides_g":5.0,"sel_g":0.6,"fibres_g":3.0},
            "fish and vegetables": {"calories":130,"proteines_g":15.0,"glucides_g":8.0,"lipides_g":4.0,"sel_g":0.8,"fibres_g":2.5},
            "rfissa": {"calories":280,"proteines_g":18.0,"glucides_g":30.0,"lipides_g":10.0,"sel_g":1.0,"fibres_g":3.0},
            "seffa": {"calories":350,"proteines_g":8.0,"glucides_g":60.0,"lipides_g":9.0,"sel_g":0.3,"fibres_g":1.5},
            "seffa with rice": {"calories":200,"proteines_g":5.0,"glucides_g":40.0,"lipides_g":3.0,"sel_g":0.2,"fibres_g":1.0},
            "meat brochettes": {"calories":200,"proteines_g":25.0,"glucides_g":2.0,"lipides_g":10.0,"sel_g":1.0,"fibres_g":0.0},
            "meatball with tomato sauce": {"calories":180,"proteines_g":14.0,"glucides_g":8.0,"lipides_g":11.0,"sel_g":0.9,"fibres_g":1.5},
            "liver with sauce": {"calories":165,"proteines_g":20.0,"glucides_g":5.0,"lipides_g":7.0,"sel_g":0.8,"fibres_g":0.0},
            "maakouda": {"calories":180,"proteines_g":5.0,"glucides_g":25.0,"lipides_g":7.0,"sel_g":0.5,"fibres_g":2.0},
            "harcha": {"calories":280,"proteines_g":6.0,"glucides_g":45.0,"lipides_g":10.0,"sel_g":0.6,"fibres_g":2.0},
            "batbout": {"calories":250,"proteines_g":7.0,"glucides_g":45.0,"lipides_g":5.0,"sel_g":0.8,"fibres_g":2.5},
            "beghrir": {"calories":180,"proteines_g":5.0,"glucides_g":30.0,"lipides_g":5.0,"sel_g":0.3,"fibres_g":1.5},
            "briouate with almonds": {"calories":350,"proteines_g":6.0,"glucides_g":40.0,"lipides_g":20.0,"sel_g":0.2,"fibres_g":2.0},
            "chebakia": {"calories":450,"proteines_g":5.0,"glucides_g":55.0,"lipides_g":25.0,"sel_g":0.1,"fibres_g":1.5},
            "sellou": {"calories":420,"proteines_g":10.0,"glucides_g":50.0,"lipides_g":22.0,"sel_g":0.1,"fibres_g":4.0},
            "sfenje": {"calories":320,"proteines_g":7.0,"glucides_g":50.0,"lipides_g":12.0,"sel_g":0.5,"fibres_g":1.5},
            "rghayf": {"calories":290,"proteines_g":7.0,"glucides_g":48.0,"lipides_g":9.0,"sel_g":0.7,"fibres_g":2.0},
            "mhancha": {"calories":380,"proteines_g":6.0,"glucides_g":45.0,"lipides_g":22.0,"sel_g":0.2,"fibres_g":2.0},
            "basbousa": {"calories":320,"proteines_g":4.0,"glucides_g":50.0,"lipides_g":13.0,"sel_g":0.3,"fibres_g":2.0},
            "gazelle horn": {"calories":400,"proteines_g":5.0,"glucides_g":48.0,"lipides_g":22.0,"sel_g":0.2,"fibres_g":2.5},
            "nougat": {"calories":450,"proteines_g":5.0,"glucides_g":65.0,"lipides_g":20.0,"sel_g":0.1,"fibres_g":1.0},
            "snowballs": {"calories":350,"proteines_g":3.0,"glucides_g":55.0,"lipides_g":15.0,"sel_g":0.1,"fibres_g":1.0},
            "kaak": {"calories":380,"proteines_g":8.0,"glucides_g":55.0,"lipides_g":15.0,"sel_g":0.8,"fibres_g":2.0},
            "fekkas": {"calories":380,"proteines_g":8.0,"glucides_g":50.0,"lipides_g":17.0,"sel_g":0.4,"fibres_g":3.0},
            "crackers with almonds (ghriba)": {"calories":450,"proteines_g":7.0,"glucides_g":50.0,"lipides_g":26.0,"sel_g":0.2,"fibres_g":2.0},
            "jam": {"calories":250,"proteines_g":0.3,"glucides_g":65.0,"lipides_g":0.1,"sel_g":0.0,"fibres_g":1.0},
            "amlou": {"calories":500,"proteines_g":12.0,"glucides_g":30.0,"lipides_g":40.0,"sel_g":0.0,"fibres_g":5.0},
            "zaalouk": {"calories":80,"proteines_g":2.0,"glucides_g":10.0,"lipides_g":4.0,"sel_g":0.6,"fibres_g":4.0},
            "taktouka": {"calories":60,"proteines_g":1.5,"glucides_g":8.0,"lipides_g":3.0,"sel_g":0.5,"fibres_g":2.5},
            "tkalya": {"calories":220,"proteines_g":18.0,"glucides_g":5.0,"lipides_g":15.0,"sel_g":1.0,"fibres_g":1.0},
            "tomatoes and onion salad": {"calories":35,"proteines_g":1.0,"glucides_g":6.0,"lipides_g":1.5,"sel_g":0.3,"fibres_g":1.5},
            "white beans with tomatoes": {"calories":120,"proteines_g":7.0,"glucides_g":20.0,"lipides_g":1.0,"sel_g":0.5,"fibres_g":6.0},
            "bissara(feves puree)": {"calories":110,"proteines_g":7.0,"glucides_g":18.0,"lipides_g":1.5,"sel_g":0.4,"fibres_g":6.0},
            "fèves with sauce": {"calories":100,"proteines_g":6.0,"glucides_g":16.0,"lipides_g":1.5,"sel_g":0.5,"fibres_g":5.0},
            "feet of beef": {"calories":200,"proteines_g":22.0,"glucides_g":0.0,"lipides_g":12.0,"sel_g":0.8,"fibres_g":0.0},
            "traditional bread": {"calories":265,"proteines_g":8.0,"glucides_g":49.0,"lipides_g":3.0,"sel_g":1.0,"fibres_g":2.5},
            "sweet bread": {"calories":300,"proteines_g":7.0,"glucides_g":50.0,"lipides_g":8.0,"sel_g":0.6,"fibres_g":2.0},
            "better beldi": {"calories":265,"proteines_g":8.0,"glucides_g":49.0,"lipides_g":3.0,"sel_g":1.0,"fibres_g":2.5},
            "bahla": {"calories":150,"proteines_g":2.0,"glucides_g":30.0,"lipides_g":3.0,"sel_g":0.3,"fibres_g":1.0},
            "zitoun": {"calories":115,"proteines_g":0.8,"glucides_g":6.0,"lipides_g":10.0,"sel_g":2.0,"fibres_g":3.0},
            "traditional macaroon": {"calories":400,"proteines_g":5.0,"glucides_g":48.0,"lipides_g":22.0,"sel_g":0.3,"fibres_g":2.0},
        }
        self.MFOOD_DENSITE = {
            "couscous":0.75,"harira":0.85,"msamen":0.60,"pizza":0.60,"hamburger":0.70,
            "rfissa":0.80,"seffa":0.75,"tagine with vegetables":0.90,"tagine with beef":0.90,
        }
        if os.path.exists(mfood_path):
            self.model       = YOLO(mfood_path)
            self.class_names = [self.model.names[i] for i in range(len(self.model.names))]
            self.is_mfood    = True
            print(f"[VisionAgent] Using MFOOD model ({len(self.class_names)} classes)")
        else:
            self.is_mfood = False
            if model_path is None:
                model_path = os.path.join(
                    os.path.dirname(__file__), "..", "models", "food_yolov8_best.pt"
                )
            self.model       = YOLO(model_path)
            self.class_names = CLASS_NAMES
            print(f"[VisionAgent] Using generic model ({len(self.class_names)} classes)")

    def analyze(self, image_bytes: bytes) -> dict:
        image        = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results      = self.model(image, conf=0.25, verbose=False)[0]
        img_w, img_h = image.size
        img_area     = img_w * img_h
        aliments     = []
        total        = {"calories":0,"proteines_g":0,"glucides_g":0,
                        "lipides_g":0,"sel_g":0,"fibres_g":0}

        nut_table = self.MFOOD70_TO_NUTRI if self.is_mfood else NUTRIMENTS_TABLE
        densites  = self.MFOOD_DENSITE if self.is_mfood else DENSITE

        for box in results.boxes:
            idx    = int(box.cls)
            classe = self.class_names[idx] if idx < len(self.class_names) else f"food_{idx}"
            conf   = float(box.conf)
            x1,y1,x2,y2 = box.xyxy[0].tolist()
            aire   = (x2-x1)*(y2-y1)
            ratio  = aire / img_area
            densite= densites.get(classe, 0.85)
            poids  = round(ratio * 2000 * densite, 1)
            ref    = nut_table.get(classe, {
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
