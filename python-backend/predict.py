
import torch
import torch.nn as nn
import torch.nn.functional as F
import librosa
import numpy as np
import os

print("predict.py: Starting script execution.")

# Emotion labels used during training
emotion_labels = ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised']

class CRNN_SER(nn.Module):
    def __init__(self, num_classes):
        super(CRNN_SER, self).__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=(3, 3), padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d((2, 2)),

            nn.Conv2d(32, 64, kernel_size=(3, 3), padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d((2, 2)),

            nn.Conv2d(64, 128, kernel_size=(3, 3), padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d((2, 2)),

            nn.Conv2d(128, 256, kernel_size=(3, 3), padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d((2, 2))
        )
        self.lstm = nn.LSTM(256 * 2, 128, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(128 * 2, num_classes)

    def forward(self, x):
        x = self.cnn(x)
        B, C, T, F = x.size()
        x = x.permute(0, 2, 1, 3).contiguous().view(B, T, -1)
        x, _ = self.lstm(x)
        return self.fc(x[:, -1, :])

def extract_mfcc(file_path, sr=16000, start_sec=0.5, end_sec=3.5, n_mfcc=40, n_fft=512, hop_length=256):
    y, _ = librosa.load(file_path, sr=sr)
    y = y[int(start_sec * sr):int(end_sec * sr)]
    if len(y) < (int(end_sec * sr) - int(start_sec * sr)):
        y = np.pad(y, (0, (int(end_sec * sr) - int(start_sec * sr)) - len(y)))
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc, n_fft=n_fft, hop_length=hop_length)
    mfcc = (mfcc - np.mean(mfcc)) / np.std(mfcc)
    return mfcc.T

def pad_or_truncate(mfcc, target_len=184):
    mfcc = torch.tensor(mfcc, dtype=torch.float32)
    if mfcc.shape[0] > target_len:
        mfcc = mfcc[:target_len]
    elif mfcc.shape[0] < target_len:
        pad_len = target_len - mfcc.shape[0]
        mfcc = torch.cat([mfcc, torch.zeros(pad_len, mfcc.shape[1])], dim=0)
    return mfcc

print("predict.py: Initializing model and device.")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CRNN_SER(num_classes=len(emotion_labels)).to(device)

# Load the model state dictionary
# Assuming crnn.pth is in the same directory as predict.py
model_path = os.path.join(os.path.dirname(__file__), "crnn.pth")
print(f"predict.py: Attempting to load model from: {model_path}")

try:
    model.load_state_dict(torch.load(model_path, map_location=device))
    print("predict.py: Model loaded successfully.")
except Exception as e:
    print(f"predict.py: Error loading model: {e}")
    # Re-raise the exception to ensure it's visible in logs if not caught by Uvicorn
    raise

model.eval()
print("predict.py: Model set to evaluation mode.")

def predict_emotion(audio_path: str):
    print(f"predict.py: predict_emotion called for {audio_path}")
    mfcc = extract_mfcc(audio_path)
    mfcc = pad_or_truncate(mfcc).unsqueeze(0).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(mfcc)
        probs = F.softmax(logits, dim=1)
        pred_idx = probs.argmax(dim=1).item()
        confidence = probs[0, pred_idx].item()
        pred_label = emotion_labels[pred_idx]

    print(f"predict.py: Prediction complete: {pred_label} with confidence {confidence}")
    return {
        "emotion": pred_label,
        "confidence": round(confidence, 4)
    }

print("predict.py: Script execution finished.")
