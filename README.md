# MUNDA — Textile Lighting Systems · Precision Assembly

An interactive wire-assembly game inspired by MUNDA **Textile Lichtsysteme GmbH** and its precision LED textile lighting production. Reinterpret the familiar "connect the matching wires" mechanic as a professional, futuristic automotive–textile manufacturing simulation.

> A gamified, fictional simulation inspired by the technology — not a reproduction of MUNDA's real manufacturing process.

## Running the game

Open **`index.html`** directly in any modern browser, or serve the folder:

```bash
python -m http.server 8123
# then open http://localhost:8123/
```

Works on desktop, laptop, tablet and mobile (mouse + touch). No build step, no dependencies, no network assets required — all audio is synthesized live with the Web Audio API and all rendering is Canvas/CSS.

## Game modes

- **Production Shift** — progressive stages from a 3-wire basic assembly to dense 9-wire routing. Complete a stage to pass quality control and advance; one wrong connection fails the assembly and resets the run to Stage 1.
- **Endless Mode** — procedurally generated boards that scale difficulty forever. A mistake stops the line and shows your final results.

## Features

- **Precision wiring mechanic** — drag or tap two matching terminals. Only a deliberate wrong connection counts as an error (releasing on empty space never punishes you).
- **Flexible textile LED strip** — a wavy, fabric-like lighting band that brightens section by section, illuminates end-to-end on completion, and flickers out on failure.
- **Accessibility by default** — every terminal is matched by **colour, number and symbol** (never colour alone), plus a colorblind-safe palette, high-contrast mode, adjustable brightness and reduced-motion settings.
- **Full customization** — 9 individually-remappable wire colours, LED strip colour, interface accent, and 6 background themes (some unlock with progression).
- **Scoring & streaks** — connection, level, precision (speed) and perfect-assembly bonuses; consecutive clean stages build a streak multiplier.
- **Persistence** — best score, highest stage, endless records and customization are saved to `localStorage`.
- **Procedural, guaranteed-solvable puzzles** — every board is validated as a solvable bijection with no overlapping terminals, at any difficulty.

## Project structure

```
index.html
css/style.css
js/
  core/    Config, Utils, Palette, Storage, Audio (Web Audio synth)
  game/    Difficulty, PuzzleGen (procedural + validation), Game (rules/scoring)
  render/  BoardRenderer (terminals & wires), StripRenderer (LED textile strip)
  ui/      Screens (menu/HUD/modals), Customization (colours + settings)
  main.js  bootstrap + unified mouse/touch input
```

Code is organized into small, single-responsibility modules — no framework, no build step.

## Accessibility & settings

Colour-blind palette · high-contrast UI · interface brightness · animation intensity (reduce motion) · sound volume & mute.

---

© MUNDA-inspired fan concept. "MUNDA" and "Textile Lichtsysteme" are trademarks of their respective owners; this is an independent fictional game.
