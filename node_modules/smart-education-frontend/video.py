# app.py
# ALL-IN-ONE minimal Video Generation Microservice (FREE, local, demo-ready)

from fastapi import FastAPI
import pdfplumber
import os
from moviepy.editor import VideoFileClip, AudioFileClip
from TTS.api import TTS
from manim import *

app = FastAPI()
OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------------
# PDF -> TEXT
# -----------------------------
def extract_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

# -----------------------------
# TEXT -> STORYBOARD (placeholder AI step)
# -----------------------------
def generate_storyboard(text, concept):
    return [
        {"title": concept, "narration": f"{concept} explained simply."},
        {"title": "Explanation", "narration": text[:400]}
    ]

# -----------------------------
# STORYBOARD -> ANIMATION (MANIM)
# -----------------------------
class AutoScene(Scene):
    def construct(self):
        title = Text("Concept Explanation", font_size=48)
        self.play(Write(title))
        self.wait(2)

def generate_animation():
    os.system("manim -pql app.py AutoScene")
    return os.path.join(OUTPUT_DIR, "AutoScene.mp4")

# -----------------------------
# STORYBOARD -> AUDIO (FREE TTS)
# -----------------------------
def generate_audio(storyboard):
    text = " ".join(scene["narration"] for scene in storyboard)
    audio_path = os.path.join(OUTPUT_DIR, "audio.wav")
    tts = TTS(model_name="tts_models/en/vctk/vits")
    tts.tts_to_file(text=text, file_path=audio_path)
    return audio_path

# -----------------------------
# MERGE VIDEO + AUDIO
# -----------------------------
def merge_audio_video(video_path, audio_path):
    final_path = os.path.join(OUTPUT_DIR, "final.mp4")
    video = VideoFileClip(video_path)
    audio = AudioFileClip(audio_path)
    video.set_audio(audio).write_videofile(final_path, codec="libx264")
    return final_path

# -----------------------------
# PIPELINE
# -----------------------------
def generate_video_pipeline(pdf_path, concept):
    text = extract_text(pdf_path)
    storyboard = generate_storyboard(text, concept)
    video = generate_animation()
    audio = generate_audio(storyboard)
    return merge_audio_video(video, audio)

# -----------------------------
# API
# -----------------------------
@app.post("/generate-video")
def generate(payload: dict):
    pdf_path = payload["pdf_path"]
    concept = payload["concept"]
    video = generate_video_pipeline(pdf_path, concept)
    return {"status": "success", "video": video}

# RUN:
# uvicorn app:app --reload
