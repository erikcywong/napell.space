#!/usr/bin/env python3
"""Generate branded one-time QR invitation cards for napell.space investors.

Usage: python gen-invite.py <qr-links.txt> <outdir>
Each link gets one 1080x1350 card (email/WeChat friendly).
QR is rendered inline (clean, no captions).
"""
import os
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
BG = (0, 0, 0)
FG = (231, 233, 236)
MUTED = (113, 118, 123)
ACCENT = (29, 155, 240)
HAIR = (40, 44, 48)
FONT_DIR = r"C:\Windows\Fonts"


def font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONT_DIR, name), size)
    except OSError:
        return ImageFont.load_default()


def ctext(d, y, text, f, fill):
    d.text((W / 2, y), text, font=f, fill=fill, anchor="ma")
    bb = d.textbbox((0, 0), text, font=f)
    return y + (bb[3] - bb[1]) + 14


def make_qr(link, box=460):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=2)
    qr.add_data(link)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return img.resize((box, box), Image.NEAREST)


def make_card(link, out_path, idx, total):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    m = 56
    d.rectangle([m, m, W - m, H - m], outline=HAIR, width=2)
    d.rectangle([m + 14, m + 14, W - m - 14, H - m - 14], outline=HAIR, width=1)

    f = lambda s: font("segoeui.ttf", s)
    fb = lambda s: font("segoeuib.ttf", s)

    y = 150
    y = ctext(d, y, "NAPELL", fb(56), FG) + 14
    y = ctext(d, y, "SEEDLINGS  ·  AEROPONIC COFFEE", f(22), MUTED) + 48

    d.line([(W / 2 - 70, y), (W / 2 + 70, y)], fill=ACCENT, width=3)
    y += 48

    y = ctext(d, y, "CONFIDENTIAL", fb(30), ACCENT)
    y = ctext(d, y, "INVESTOR PROPOSAL", fb(44), FG) + 40
    y = ctext(d, y, "napell.space", f(26), MUTED) + 40

    qx, qy = (W - 460) // 2, int(y)
    d.rectangle([qx - 18, qy - 18, qx + 478, qy + 478], fill=(255, 255, 255))
    img.paste(make_qr(link), (qx, qy))
    d.rectangle([qx - 18, qy - 18, qx + 478, qy + 478], outline=HAIR, width=2)
    y = qy + 478 + 52

    y = ctext(d, y, "Scan to enter", fb(32), FG)
    y = ctext(d, y, "This invitation opens the private proposal once.", f(21), MUTED)
    y = ctext(d, y, "Access stays live for 60 minutes after entry,", f(21), MUTED)
    y = ctext(d, y, "and closes for good after you leave.", f(21), MUTED) + 34

    d.line([(W / 2 - 70, y), (W / 2 + 70, y)], fill=HAIR, width=2)
    y += 30
    y = ctext(d, y, "erik.wong@napell.bio", f(22), ACCENT)
    ctext(d, y, f"Invitation {idx:02d} / {total:02d}", f(17), MUTED)

    img.save(out_path, quality=92)


def main():
    links_file, outdir = sys.argv[1], sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    links = [l.strip() for l in open(links_file, encoding="utf-8") if l.strip().startswith("http")]
    for i, link in enumerate(links, 1):
        make_card(link, os.path.join(outdir, f"invite-{i:02d}.png"), i, len(links))
    print(f"done: {len(links)} cards -> {outdir}")


if __name__ == "__main__":
    main()
