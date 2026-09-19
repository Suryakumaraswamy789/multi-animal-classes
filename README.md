# 🐾 Multi-Class Animal Classifier

A deep learning web app that identifies **90 animal species** from images using MobileNetV2. Built with a **FastAPI** backend and **React** frontend.

---

## Project Structure

```
multi-animal-classes-main/
├── MCAR.keras                        # Trained model file
├── multi_class_animal.ipynb          # Training notebook (Google Colab)
├── README.md
└── animal-classifier/
    ├── backend/
    │   ├── main.py                   # FastAPI app
    │   ├── requirements.txt
    │   └── MCAR.keras                # Copy of model (required here)
    └── frontend/
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── main.jsx
            ├── App.jsx
            └── index.css
```

---

## Requirements

- Python 3.10 or 3.11
- Node.js 18+
- pip

---

## Setup & Run

### Step 1 — Copy the model into the backend folder

The model file must be present inside the `backend` folder before starting the server.

```cmd
copy multi-animal-classes-main\MCAR.keras multi-animal-classes-main\animal-classifier\backend\MCAR.keras
```

Or on PowerShell:
```powershell
Copy-Item "multi-animal-classes-main\MCAR.keras" "multi-animal-classes-main\animal-classifier\backend\MCAR.keras"
```

---

### Step 2 — Start the Backend (FastAPI)

Open a terminal and run:

```cmd
cd multi-animal-classes-main\animal-classifier\backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see:
```
Model loaded successfully.
INFO: Uvicorn running on http://127.0.0.1:8000
```

If you see `WARNING: Model file not found`, the `.keras` file is not in the backend folder — go back to Step 1.

---

### Step 3 — Start the Frontend (React)

Open a **second terminal** and run:

```cmd
cd multi-animal-classes-main\animal-classifier\frontend
npm install
npm run dev
```

You should see:
```
VITE ready on http://localhost:5173
```

---

### Step 4 — Open the App

Go to **http://localhost:5173** in your browser.

- Drag & drop or click to upload any animal image
- Click **Classify Animal**
- See the predicted species + top 5 confidence scores

---

## API Endpoints

The backend runs on `http://localhost:8000`.

| Method | Endpoint   | Description                        |
|--------|------------|------------------------------------|
| GET    | `/health`  | Check if server and model are live |
| POST   | `/predict` | Upload an image, get prediction    |

### Example — test with curl

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@your_image.jpg"
```

### Example response

```json
{
  "prediction": "tiger",
  "confidence": 94.31,
  "top5": [
    { "label": "tiger",   "confidence": 94.31 },
    { "label": "leopard", "confidence":  3.12 },
    { "label": "lion",    "confidence":  1.05 },
    { "label": "cat",     "confidence":  0.87 },
    { "label": "chimpanzee", "confidence": 0.65 }
  ]
}
```

---

## Model Details

| Property        | Value                          |
|-----------------|-------------------------------|
| Architecture    | MobileNetV2 (transfer learning)|
| Input size      | 224 × 224 × 3                 |
| Output classes  | 90                             |
| Activation      | Softmax                        |
| Training env    | Google Colab (GPU)             |
| Dataset         | [Animal Image Dataset — 90 Animals](https://www.kaggle.com/datasets/iamsouravbanerjee/animal-image-dataset-90-different-animals) |

---

## Supported Animals (90 classes)

`antelope` `badger` `bat` `bear` `bee` `beetle` `bison` `boar` `butterfly` `cat`
`caterpillar` `chimpanzee` `cockroach` `cow` `coyote` `crab` `crow` `deer` `dog` `dolphin`
`donkey` `dragonfly` `duck` `eagle` `elephant` `flamingo` `fly` `fox` `goat` `goldfish`
`goose` `gorilla` `grasshopper` `hamster` `hare` `hedgehog` `hippopotamus` `hornbill` `horse` `hummingbird`
`hyena` `jellyfish` `kangaroo` `koala` `ladybugs` `leopard` `lion` `lizard` `lobster` `mosquito`
`moth` `mouse` `octopus` `okapi` `orangutan` `otter` `owl` `ox` `oyster` `panda`
`parrot` `pelecaniformes` `penguin` `pig` `pigeon` `porcupine` `possum` `raccoon` `rat` `reindeer`
`rhinoceros` `sandpiper` `seahorse` `seal` `shark` `sheep` `snake` `sparrow` `squid` `squirrel`
`starfish` `swan` `tiger` `turkey` `turtle` `whale` `wolf` `wombat` `woodpecker` `zebra`

---

## Troubleshooting

**`Model file not found` on startup**
→ Make sure `MCAR.keras` is copied into `animal-classifier/backend/`

**`Cannot reach backend` in the UI**
→ Make sure uvicorn is running on port 8000 before opening the frontend

**`ERROR: Could not find a version that satisfies the requirement tensorflow==...`**
→ Run `pip install tensorflow` without a version pin to get the latest compatible version

**Frontend shows blank page**
→ Run `npm install` inside the `frontend` folder first, then `npm run dev`

**Wrong predictions**
→ The model expects natural photos of single animals. Very small, blurry, or heavily cropped images may reduce accuracy.
