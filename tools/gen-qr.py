#!/usr/bin/env python3
"""gen-qr.py — turn one-time access links into branded QR PNG sheets.

Usage:  python tools/gen-qr.py <links.txt> <out_dir>
links.txt: one URL per line (from /api/tokens?...&format=text)
Output: one PNG per link + a contact sheet (_sheet.png) with all codes.
"""
import sys, os, math
from io import BytesIO
import qrcode
from PIL import Image, ImageDraw, ImageFont

def make_qr(url: str) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB")

def main():
    links_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    links = [l.strip() for l in open(links_path, encoding="utf-8") if l.strip()]
    tiles = []
    try:
        font = ImageFont.truetype("arial.ttf", 18)
        big = ImageFont.truetype("arialbd.ttf", 22)
    except OSError:
        font = big = ImageFont.load_default()
    for i, url in enumerate(links, 1):
        img = make_qr(url)
        card = Image.new("RGB", (img.width + 40, img.height + 96), "white")
        card.paste(img, (20, 20))
        d = ImageDraw.Draw(card)
        token = url.split("t=")[-1][:8].upper()
        d.text((card.width // 2, img.height + 40), f"NAPIELL · ONE-TIME {i:02d}", fill="#0f1419", font=font, anchor="mm")
        d.text((card.width // 2, img.height + 66), f"NO. {token}…  scan once only", fill="#71767b", font=font, anchor="mm")
        out = os.path.join(out_dir, f"qr-{i:02d}-{token}.png")
        card.save(out)
        tiles.append((out, card))
        print("✓", out)
    # contact sheet
    cols = 5
    rows = math.ceil(len(tiles) / cols)
    tw, th = tiles[0][1].size
    sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + 16) + 16), "#f0f2f5")
    sd = ImageDraw.Draw(sheet)
    sd.text((sheet.width // 2, 8), "napell.space — one-time QR access codes", fill="#0f1419", font=big, anchor="ma")
    for idx, (_, card) in enumerate(tiles):
        x = 16 + (idx % cols) * (tw + 16)
        y = 40 + (idx // cols) * (th + 16)
        sheet.paste(card, (x, y))
    sheet_path = os.path.join(out_dir, "_sheet.png")
    sheet.save(sheet_path)
    print("✓", sheet_path)

if __name__ == "__main__":
    main()
