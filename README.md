# MUNDA — Textile Lighting Systems

A polished interactive website **and** a precision wire-assembly game, inspired by MUNDA **Textile Lichtsysteme GmbH** and its LED textile lighting production.

> A gamified, fictional concept inspired by the technology — not a reproduction of MUNDA's real manufacturing process.

## Running it

The website is the entry point — the game is integrated inside it. Serve the repo root and open the site:

```bash
python -m http.server 8123
# then open http://localhost:8123/
```

- The **website** appears first (landing page).
- Click the small **PLAY THE GAME →** button (in the nav, or the floating ▶ PLAY button) to enter the game in a full-screen overlay, then **✕ EXIT GAME** (or press Escape) to return to the site.
- The game can also be opened directly at `http://localhost:8123/game/`.

Works on desktop, laptop, tablet and mobile. No build step, no dependencies — audio is synthesized live with the Web Audio API and all rendering is Canvas/CSS.

## Structure

```
index.html          ← website (landing page)
css/style.css       ← website styles
js/main.js          ← website interactions
assets/             ← website imagery
game/               ← the MUNDA wire-assembly game
  index.html
  css/style.css
  js/
    core/     Config, Utils, Palette, Storage, Audio (Web Audio synth)
    game/     Difficulty, PuzzleGen (procedural + validation), Game (rules/scoring)
    render/   BoardRenderer (terminals & wires), StripRenderer (LED textile strip)
    ui/       Screens (menu/HUD/modals), Customization (colours + settings)
    main.js   bootstrap + unified mouse/touch input
```

## Connecting the game

The site's game buttons read two config variables at the top of `index.html`:

```js
var GAME_URL = "game/index.html";   // <-- set to your hosted game URL
var USE_EMBEDDED_GAME = true;       // true = game plays inside the website
```

`USE_EMBEDDED_GAME = true` (default) opens the game in a full-screen overlay inside the website; cross-origin URLs automatically fall back to opening in a new tab.

## Website

A responsive marketing site sharing the game's design system (dark industrial background, electric-cyan accents, LED glow, glass panels). Sections: hero with animated light paths · What is MUNDA (TEXTILE → ELECTRONICS → LIGHT) · Why Textile Lighting · Automotive Applications · MUNDA Kosova (animated stats) · Precision Manufacturing timeline · Lectra cutting technology · Volkswagen Group quality · Industry 4.0 network · Interactive Technology Explorer · the game showcase · final CTA · footer.

## Game

- **Production Shift** — progressive stages from a 3-wire basic assembly to dense 9-wire routing. One wrong connection fails the assembly and resets the run to Stage 1.
- **Endless Mode** — procedurally generated boards that scale difficulty forever.
- **Precision wiring mechanic** — drag or tap two matching terminals; only a deliberate wrong connection counts as an error.
- **Flexible textile LED strip** — a wavy, fabric-like lighting band that brightens per connection, illuminates end-to-end on completion, and flickers out on failure.
- **Accessibility by default** — every terminal matched by **colour, number and symbol**, plus a colorblind palette, high-contrast mode, brightness and reduced-motion settings.
- **Full customization** — 9 remappable wire colours, LED strip colour, interface accent, 6 background themes.
- **Scoring & streaks** — connection, level, precision (speed) and perfect-assembly bonuses, plus a streak multiplier.
- **Persistence** — best score, highest stage, endless records and customization saved to `localStorage`.
- **Procedural, guaranteed-solvable puzzles** — every board validated as a solvable bijection with no overlapping terminals.

---

© MUNDA-inspired fan concept. "MUNDA" and "Textile Lichtsysteme" are trademarks of their respective owners; this is an independent fictional project.
