#!/usr/bin/env python3
"""batch-issue.py — mint N one-time tokens and drop QR invite cards into a
named batch directory, e.g.

    python tools/batch-issue.py 10 "D:\\WorkBuddy\\napell.space\\qrcode\\2nd batch" 14

Args: <N> <outdir> [start_index]
Card numbering continues the global ledger (qr-links.txt). Each batch dir
gets: links.txt, invite-<NN>.png cards, qr-<NN>-<TOKEN>.png raw codes,
_sheet.png contact sheet.
"""
import importlib.util
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ii", os.path.join(HERE, "issue-invites.py"))
ii = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ii)


def main():
    n = int(sys.argv[1])
    outdir = sys.argv[2]
    # global numbering: continue after the last line of the shared ledger
    ledger = ii.LINKS
    start = 1
    if os.path.exists(ledger):
        start = sum(1 for l in open(ledger, encoding="utf-8") if l.strip().startswith("http")) + 1
    if len(sys.argv) > 3:
        start = int(sys.argv[3])

    key = open(ii.KEY_FILE, encoding="utf-8").read().strip()
    links = ii.mint_tokens(key, n)
    if len(links) != n:
        sys.exit(f"expected {n} tokens, got {len(links)}")

    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, "links.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(links) + "\n")
    with open(ledger, "a", encoding="utf-8") as fh:
        fh.write("\n".join(links) + "\n")

    tiles = []
    try:
        f18 = ImageFont.truetype("arial.ttf", 18)
    except OSError:
        f18 = ImageFont.load_default()

    for i, link in enumerate(links):
        idx = start + i
        token = link.split("t=")[-1][:8].upper()
        qr = ii.make_qr(link)

        card = Image.new("RGB", (qr.width + 40, qr.height + 96), "white")
        card.paste(qr, (20, 20))
        d = ImageDraw.Draw(card)
        d.text((card.width // 2, qr.height + 40), f"NAPELL · ONE-TIME {idx:02d}", fill="#0f1419", font=f18, anchor="mm")
        d.text((card.width // 2, qr.height + 66), f"NO. {token}…  scan once only", fill="#71767b", font=f18, anchor="mm")
        qpath = os.path.join(outdir, f"qr-{idx:02d}-{token}.png")
        card.save(qpath)

        cpath = os.path.join(outdir, f"invite-{idx:02d}.png")
        ii.make_card(link, cpath, idx, start + n - 1)
        tiles.append(card)
        print(f"ok  #{idx:02d}  {cpath}")

    # contact sheet for printing
    cols = 5
    rows = math.ceil(len(tiles) / cols)
    tw, th = tiles[0].size
    sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + 16) + 16), "#f0f2f5")
    sd = ImageDraw.Draw(sheet)
    big = ImageFont.truetype("arialbd.ttf", 22) if os.path.exists(r"C:\Windows\Fonts\arialbd.ttf") else ImageFont.load_default()
    sd.text((sheet.width // 2, 8), f"napell.space — one-time QR access codes  (#{start:02d}-#{start + n - 1:02d})", fill="#0f1419", font=big, anchor="ma")
    for k, card in enumerate(tiles):
        sheet.paste(card, (16 + (k % cols) * (tw + 16), 40 + (k // cols) * (th + 16)))
    sheet.save(os.path.join(outdir, "_sheet.png"))
    print(f"done: {n} invites (#{start:02d}-#{start + n - 1:02d}) -> {outdir}")


if __name__ == "__main__":
    main()
