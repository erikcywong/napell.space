#!/usr/bin/env python3
"""issue-invites.py — one command to issue N one-time QR invitation cards.

Flow: ask the worker to mint N tokens -> save links -> render QR codes and
branded cards. ALL output goes to D:\\WorkBuddy\\napell.space\\.workbuddy\\
(links, qr-codes/, invites/) so future batches always land in one place.

Usage:  python tools/issue-invites.py [N]        (default N = 5)

Requires the STATS_KEY stored in ..\\napell.space\\.workbuddy\\stats-key.txt
(kept OUTSIDE the repo on purpose — never commit it).
"""
import json
import math
import os
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFont
import qrcode

BASE = r"D:\WorkBuddy\napell.space\.workbuddy"
KEY_FILE = os.path.join(BASE, "stats-key.txt")
LINKS = os.path.join(BASE, "qr-links.txt")
QR_DIR = os.path.join(BASE, "qr-codes")
CARD_DIR = os.path.join(BASE, "invites")
API = "https://api.napell.space/api/tokens"

CARD_W, CARD_H = 1080, 1350
BG, FG, MUTED, ACCENT, HAIR = (0, 0, 0), (231, 233, 236), (113, 118, 123), (29, 155, 240), (40, 44, 48)
FONT_DIR = r"C:\Windows\Fonts"


def font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONT_DIR, name), size)
    except OSError:
        return ImageFont.load_default()


def ctext(d, y, text, f, fill):
    d.text((CARD_W / 2, y), text, font=f, fill=fill, anchor="ma")
    bb = d.textbbox((0, 0), text, font=f)
    return y + (bb[3] - bb[1]) + 14


def mint_tokens(key, n):
    url = f"{API}?key={key}&n={n}&format=text"
    # bypass system proxies (mainland network) and use a browser UA so
    # Cloudflare bot rules don't 403 the default Python agent
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with opener.open(req, timeout=30) as r:
        body = r.read().decode()
    links = [l.strip() for l in body.splitlines() if l.strip().startswith("http")]
    return links


def make_qr(link, box=460):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=2)
    qr.add_data(link)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return img.resize((box, box), Image.NEAREST)


def make_card(link, out_path, idx, total):
    img = Image.new("RGB", (CARD_W, CARD_H), BG)
    d = ImageDraw.Draw(img)
    m = 56
    d.rectangle([m, m, CARD_W - m, CARD_H - m], outline=HAIR, width=2)
    d.rectangle([m + 14, m + 14, CARD_W - m - 14, CARD_H - m - 14], outline=HAIR, width=1)
    f = lambda s: font("segoeui.ttf", s)
    fb = lambda s: font("segoeuib.ttf", s)

    y = 150
    y = ctext(d, y, "NAPELL", fb(56), FG) + 14
    y = ctext(d, y, "SEEDLINGS  ·  AEROPONIC COFFEE", f(22), MUTED) + 48
    d.line([(CARD_W / 2 - 70, y), (CARD_W / 2 + 70, y)], fill=ACCENT, width=3)
    y += 48
    y = ctext(d, y, "CONFIDENTIAL", fb(30), ACCENT)
    y = ctext(d, y, "INVESTOR PROPOSAL", fb(44), FG) + 40
    y = ctext(d, y, "napell.space", f(26), MUTED) + 40

    qx, qy = (CARD_W - 460) // 2, int(y)
    d.rectangle([qx - 18, qy - 18, qx + 478, qy + 478], fill=(255, 255, 255))
    img.paste(make_qr(link), (qx, qy))
    d.rectangle([qx - 18, qy - 18, qx + 478, qy + 478], outline=HAIR, width=2)
    y = qy + 478 + 52

    y = ctext(d, y, "Scan to enter", fb(32), FG)
    y = ctext(d, y, "This invitation opens the private proposal once.", f(21), MUTED)
    y = ctext(d, y, "Access stays live for 60 minutes after entry,", f(21), MUTED)
    y = ctext(d, y, "and closes for good after you leave.", f(21), MUTED) + 34
    d.line([(CARD_W / 2 - 70, y), (CARD_W / 2 + 70, y)], fill=HAIR, width=2)
    y += 30
    y = ctext(d, y, "erik.wong@napell.bio", f(22), ACCENT)
    ctext(d, y, f"Invitation {idx:02d} / {total:02d}", f(17), MUTED)
    img.save(out_path, quality=92)


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    if not os.path.exists(KEY_FILE):
        sys.exit(f"missing {KEY_FILE} — put the STATS_KEY in it first")
    key = open(KEY_FILE, encoding="utf-8").read().strip()

    links = mint_tokens(key, n)
    if not links:
        sys.exit("no tokens returned by worker")

    # append to the running links ledger
    with open(LINKS, "a", encoding="utf-8") as fh:
        fh.write("\n".join(links) + "\n")

    # start card numbering after existing cards in the ledger
    existing = sum(1 for l in open(LINKS, encoding="utf-8") if l.strip().startswith("http"))
    os.makedirs(QR_DIR, exist_ok=True)
    os.makedirs(CARD_DIR, exist_ok=True)

    first = existing - len(links) + 1
    for i, link in enumerate(links):
        idx = first + i
        token = link.split("t=")[-1][:8].upper()
        qr = make_qr(link)
        card = Image.new("RGB", (qr.width + 40, qr.height + 96), "white")
        card.paste(qr, (20, 20))
        d = ImageDraw.Draw(card)
        f18 = font("arial.ttf", 18)
        d.text((card.width // 2, qr.height + 40), f"NAPELL · ONE-TIME {idx:02d}", fill="#0f1419", font=f18, anchor="mm")
        d.text((card.width // 2, qr.height + 66), f"NO. {token}…  scan once only", fill="#71767b", font=f18, anchor="mm")
        qr_path = os.path.join(QR_DIR, f"qr-{idx:02d}-{token}.png")
        card.save(qr_path)

        card_path = os.path.join(CARD_DIR, f"invite-{idx:02d}.png")
        make_card(link, card_path, idx, existing)
        print(f"ok  {card_path}")

    print(f"done: {len(links)} new invites (#{first:02d}-#{existing:02d}) -> {CARD_DIR}")


if __name__ == "__main__":
    main()
