#!/usr/bin/env python
"""Generate a subtle ASCII textile loop from MUNDA's official demo video."""
from __future__ import annotations

import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

GRID_W, GRID_H = 96, 54
CELL = 10
FPS = 15
FRAMES = 78
CHARS = "  .·:;+xX#@"


def main(source: str, output: str) -> None:
    source_path = Path(source)
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    font_path = Path("C:/Windows/Fonts/consola.ttf")
    font = ImageFont.truetype(str(font_path), 10) if font_path.exists() else ImageFont.load_default()

    decoder = subprocess.Popen([
        "ffmpeg", "-v", "error", "-stream_loop", "1", "-i", str(source_path),
        "-vf", f"fps={FPS},scale={GRID_W}:{GRID_H}:flags=lanczos,format=gray",
        "-frames:v", str(FRAMES), "-f", "rawvideo", "-pix_fmt", "gray", "-"
    ], stdout=subprocess.PIPE)
    encoder = subprocess.Popen([
        "ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{GRID_W * CELL}x{GRID_H * CELL}", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "25",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output_path)
    ], stdin=subprocess.PIPE)

    assert decoder.stdout and encoder.stdin
    frame_bytes = GRID_W * GRID_H
    for frame_index in range(FRAMES):
        raw = decoder.stdout.read(frame_bytes)
        if len(raw) != frame_bytes:
            raise RuntimeError(f"decoder ended at frame {frame_index}")
        values = np.frombuffer(raw, dtype=np.uint8).reshape(GRID_H, GRID_W)
        pulse = 0.88 + 0.12 * math.sin(frame_index / FPS * math.tau / 2.6)
        canvas = Image.new("RGB", (GRID_W * CELL, GRID_H * CELL), (12, 12, 13))
        draw = ImageDraw.Draw(canvas)
        for y in range(GRID_H):
            for x in range(GRID_W):
                value = int(values[y, x] * pulse)
                idx = min(len(CHARS) - 1, value * len(CHARS) // 256)
                char = CHARS[idx]
                if char.strip():
                    tone = 50 + int(value * 0.58)
                    draw.text((x * CELL, y * CELL - 1), char, font=font, fill=(tone, tone, min(210, tone + 4)))
        encoder.stdin.write(np.asarray(canvas, dtype=np.uint8).tobytes())

    decoder.stdout.close()
    decoder.wait()
    encoder.stdin.close()
    if encoder.wait() != 0:
        raise RuntimeError("ffmpeg encoder failed")
    print(output_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate_ascii_textile.py SOURCE.mp4 OUTPUT.mp4")
    main(sys.argv[1], sys.argv[2])
