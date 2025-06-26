
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
from .predict import predict_emotion, emotion_labels

app = FastAPI()

@app.post("/predict/")
async def predict_audio_emotion(audio_file: UploadFile = File(...)):
    if not audio_file.filename.endswith((".wav", ".mp3")):
        raise HTTPException(status_code=400, detail="Invalid file format. Only .wav and .mp3 are supported.")

    # Create a temporary file to save the uploaded audio
    temp_file_path = f"/tmp/{audio_file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    try:
        result = predict_emotion(temp_file_path)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/emotions/")
async def get_emotions():
    return JSONResponse(content=emotion_labels)
