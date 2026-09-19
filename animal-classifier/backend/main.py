from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import os

app = FastAPI(title="Animal Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 90 classes sorted alphabetically — matches flow_from_directory ordering used during training
CLASSES = [
    'antelope', 'badger', 'bat', 'bear', 'bee', 'beetle', 'bison', 'boar',
    'butterfly', 'cat', 'caterpillar', 'chimpanzee', 'cockroach', 'cow', 'coyote',
    'crab', 'crow', 'deer', 'dog', 'dolphin', 'donkey', 'dragonfly', 'duck',
    'eagle', 'elephant', 'flamingo', 'fly', 'fox', 'goat', 'goldfish', 'goose',
    'gorilla', 'grasshopper', 'hamster', 'hare', 'hedgehog', 'hippopotamus',
    'hornbill', 'horse', 'hummingbird', 'hyena', 'jellyfish', 'kangaroo', 'koala',
    'ladybugs', 'leopard', 'lion', 'lizard', 'lobster', 'mosquito', 'moth', 'mouse',
    'octopus', 'okapi', 'orangutan', 'otter', 'owl', 'ox', 'oyster', 'panda',
    'parrot', 'pelecaniformes', 'penguin', 'pig', 'pigeon', 'porcupine', 'possum',
    'raccoon', 'rat', 'reindeer', 'rhinoceros', 'sandpiper', 'seahorse', 'seal',
    'shark', 'sheep', 'snake', 'sparrow', 'squid', 'squirrel', 'starfish', 'swan',
    'tiger', 'turkey', 'turtle', 'whale', 'wolf', 'wombat', 'woodpecker', 'zebra'
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "MCAR.keras")
model = None

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"WARNING: Model file not found at {MODEL_PATH}")
        return
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Place MCAR.keras in the backend folder.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image: {e}")

    preds = model.predict(arr)[0]  # shape: (90,)
    top5_idx = preds.argsort()[-5:][::-1]
    results = [
        {"label": CLASSES[i], "confidence": round(float(preds[i]) * 100, 2)}
        for i in top5_idx
    ]

    return JSONResponse({
        "prediction": results[0]["label"],
        "confidence": results[0]["confidence"],
        "top5": results
    })
