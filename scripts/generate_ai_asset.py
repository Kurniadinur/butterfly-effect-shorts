"""
Autonomous AI 3D Medical Asset Generator & Cutout Engine
Generates 3D Zack D. Films style character poses or anatomical organs on-the-fly,
then automatically removes the background using AI (rembg) to produce transparent PNGs.
"""

import sys
import os
import urllib.parse
import urllib.request
import io
import time
from PIL import Image
import rembg

def generate_asset(asset_type: str, subject_description: str, output_path: str):
    print(f"\n[AI Asset Generator] Menghasilkan aset {asset_type} baru secara otonom...")
    print(f"  Deskripsi Visual : {subject_description}")
    print(f"  Target File      : {output_path}")

    # Build prompt tailored to Zack D. Films 3D style
    if asset_type == "character":
        prompt = (
            f"3D stylized realistic character {subject_description}, "
            f"Pixar and Zack D Films animation style, expressive face, "
            f"isolated subject, standing pose, plain solid white background, "
            f"cinematic studio lighting, smooth 3D textures, clean silhouette"
        )
    else:  # organ
        prompt = (
            f"3D medical anatomical human {subject_description}, "
            f"isolated organ specimen, glowing bioluminescent details, "
            f"Zack D Films 3D anatomy style, smooth translucent tissues, "
            f"plain solid dark background, scientific 3D illustration"
        )

    encoded_prompt = urllib.parse.quote(prompt)
    seed = int(time.time()) % 100000
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=768&height=1024&nologo=true&seed={seed}"

    print(f"  Mengunduh visual 3D dari AI visual generator...")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AutonomousMedicalAI/2.0"}
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        image_bytes = response.read()

    print(f"  Visual diterima ({len(image_bytes) // 1024} KB). Menghapus latar belakang dengan AI rembg...")
    input_image = Image.open(io.BytesIO(image_bytes))

    # Remove background with rembg
    output_image = rembg.remove(input_image)

    # Ensure parent dir exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    output_image.save(output_path, "PNG")
    print(f"  [BERHASIL] Aset transparan PNG disimpan di: {output_path}\n")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python generate_ai_asset.py <character|organ> <description> <outputPath>")
        sys.exit(1)

    a_type = sys.argv[1]
    a_desc = sys.argv[2]
    a_out = sys.argv[3]
    generate_asset(a_type, a_desc, a_out)
