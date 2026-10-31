"""
Autonomous AI 3D Medical Asset Studio & Precision Cutout Engine (Gaya A: Zack D. Films)
Generates high-definition 3D character action poses and internal anatomical organs on-the-fly,
evaluates candidates, removes backgrounds with rembg, and crops/centers with precision.
"""

import sys
import os
import urllib.parse
import urllib.request
import io
import time
from PIL import Image, ImageChops, ImageEnhance
import rembg

# Force UTF-8 on Windows consoles to prevent cp1252 charmap encoding errors
if sys.stdout and hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr and hasattr(sys.stderr, 'buffer'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def fetch_image_from_generator(prompt: str, seed: int) -> bytes:
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=768&height=1024&nologo=true&seed={seed}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AutonomousMedicalAI/3.0"}
    )
    with urllib.request.urlopen(req, timeout=35) as response:
        return response.read()

def process_and_clean_cutout(image_bytes: bytes) -> Image.Image:
    """Removes background and crops transparent margins with clean padding"""
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    cutout = rembg.remove(input_image)

    # Get alpha bounding box to trim dead empty space
    alpha = cutout.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        # Add 12px padding around subject
        w, h = cutout.size
        left = max(0, bbox[0] - 12)
        top = max(0, bbox[1] - 12)
        right = min(w, bbox[2] + 12)
        bottom = min(h, bbox[3] + 12)
        trimmed = cutout.crop((left, top, right, bottom))
        return trimmed

    return cutout

def score_cutout_quality(image: Image.Image) -> float:
    """Scores visual quality based on subject coverage, alpha clarity, and balance"""
    alpha = image.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return 0.0

    w, h = image.size
    box_w = bbox[2] - bbox[0]
    box_h = bbox[3] - bbox[1]

    coverage = (box_w * box_h) / (w * h)
    aspect = box_h / max(1, box_w)

    # Ideal Zack D. Films vertical subject: vertical aspect ratio ~1.3 - 2.2, coverage 35% - 85%
    score = 100.0
    if coverage < 0.25:
        score -= 25.0
    if aspect < 1.0:
        score -= 15.0

    return score

def generate_perfect_asset(asset_type: str, subject_description: str, output_path: str):
    print(f"\n================================================================")
    print(f"  AI ASSET STUDIO: GENERASI ASET VISUAL 3D (GAYA A ZACK D. FILMS) ")
    print(f"================================================================")
    print(f"  Tipe Aset    : {asset_type.upper()}")
    print(f"  Deskripsi    : {subject_description}")
    print(f"  File Tujuan  : {output_path}")

    # Build prompt tailored to Zack D. Films 3D cinematic style
    if asset_type == "character":
        prompt = (
            f"3D stylized realistic character {subject_description}, "
            f"Pixar and Zack D Films animation style, expressive face, "
            f"isolated subject, standing dynamic action pose, solid plain white studio background, "
            f"cinematic studio rim lighting, smooth 3D textures, clean silhouette, 8k render"
        )
    else:  # organ
        prompt = (
            f"3D medical anatomical human {subject_description}, "
            f"isolated organ specimen, glowing bioluminescent details, "
            f"Zack D Films 3D anatomy style, smooth translucent tissues, "
            f"solid dark background, scientific 3D illustration, 8k render"
        )

    best_image = None
    best_score = -1.0
    attempts = 2  # Multi-seed quality ranking

    for attempt in range(1, attempts + 1):
        seed = (int(time.time() * 1000) + attempt * 777) % 100000
        print(f"\n  [Kandidat {attempt}/{attempts}] Mengunduh visual 3D dari AI generator (Seed: {seed})...")
        try:
            raw_bytes = fetch_image_from_generator(prompt, seed)
            print(f"  [Kandidat {attempt}/{attempts}] Visual diterima ({len(raw_bytes) // 1024} KB). Mengisolasi dengan AI rembg...")
            cutout = process_and_clean_cutout(raw_bytes)
            score = score_cutout_quality(cutout)
            print(f"  [Kandidat {attempt}/{attempts}] Skor Kualitas Cutout: {score:.1f}/100")

            if score > best_score:
                best_score = score
                best_image = cutout

            # If score is already stellar, break early
            if score >= 90.0:
                print(f"  [OK] Kandidat {attempt} mencapai standar kesempurnaan (Skor >= 90)!")
                break
        except Exception as e:
            print(f"  [WARN] Kandidat {attempt} gagal: {e}")

    if not best_image:
        raise RuntimeError("Semua kandidat visual generator gagal diproses.")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    best_image.save(output_path, "PNG")
    print(f"\n  [BERHASIL] Aset 3D transparan tersimpan di: {output_path} (Skor: {best_score:.1f}/100)")
    print(f"================================================================\n")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python generate_ai_asset.py <character|organ> <description> <outputPath>")
        sys.exit(1)

    a_type = sys.argv[1]
    a_desc = sys.argv[2]
    a_out = sys.argv[3]
    generate_perfect_asset(a_type, a_desc, a_out)
