"""
Utility script to remove background from generated asset images using rembg and Pillow.
Saves cleanly isolated transparent PNGs.
"""

import sys
import os
from PIL import Image
from rembg import remove

def process_image(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: input file {input_path} does not exist", file=sys.stderr)
        sys.exit(1)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    print(f"Loading {input_path}...")
    with open(input_path, 'rb') as f:
        input_bytes = f.read()

    print("Running rembg background removal...")
    output_bytes = remove(input_bytes)

    # Save temporary PNG
    temp_out = output_path + ".tmp.png"
    with open(temp_out, 'wb') as f:
        f.write(output_bytes)

    # Open with PIL, crop transparent margins, and save optimized PNG
    img = Image.open(temp_out).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path, "PNG", optimize=True)
    if os.path.exists(temp_out):
        os.remove(temp_out)

    print(f"Successfully saved transparent PNG to {output_path} ({img.size[0]}x{img.size[1]})")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python remove_background.py <input_path> <output_path>")
        sys.exit(1)

    process_image(sys.argv[1], sys.argv[2])
