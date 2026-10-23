import sys
import json
import os
import whisper

default_audio = os.path.join(os.path.dirname(__file__), "..", "public", "butterfly", "audio", "berlin_wall_voiceover.wav")
default_output = os.path.join(os.path.dirname(__file__), "..", "public", "butterfly", "audio", "whisper_timestamps.json")

AUDIO_PATH = sys.argv[1] if len(sys.argv) > 1 else default_audio
OUTPUT_JSON = sys.argv[2] if len(sys.argv) > 2 else default_output

print(f"[Whisper ASR] Loading Whisper model (base)...")
model = whisper.load_model("base")

print(f"[Whisper ASR] Transcribing & extracting millisecond timestamps from:\n  {AUDIO_PATH}")
result = model.transcribe(
    AUDIO_PATH,
    language="id",
    word_timestamps=True,
    verbose=False
)

segments = []
all_words = []

for seg in result.get("segments", []):
    seg_words = []
    if "words" in seg:
        for w in seg["words"]:
            cleaned_w = w["word"].strip()
            if cleaned_w:
                word_obj = {
                    "word": cleaned_w,
                    "start": round(w["start"], 3),
                    "end": round(w["end"], 3),
                }
                seg_words.append(word_obj)
                all_words.append(word_obj)
    segments.append({
        "id": seg["id"],
        "start": round(seg["start"], 3),
        "end": round(seg["end"], 3),
        "text": seg["text"].strip(),
        "words": seg_words
    })

last_end = segments[-1]["end"] if segments else 0.0

data = {
    "totalDurationSec": round(last_end, 2),
    "segments": segments,
    "allWords": all_words
}

os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"[Whisper ASR] SUKSES! Ekstraksi {len(all_words)} kata dari {len(segments)} segmen.")
print(f"[Whisper ASR] Durasi audio aktual: {round(last_end, 2)} detik.")
print(f"[Whisper ASR] Output tersimpan di: {OUTPUT_JSON}")
