# CubeMonke

A speedcubing timer with a virtual 3D cube you turn from the keyboard. Live at
**https://cubemonke.com**.

- 2×2, 3×3 and 4×4, with random-move scrambles or your own custom scramble
- Inspection countdown, timer, and per-solve analytics (TPS curve, pauses, first move, reverted turns)
- Replays: personal bests are recorded automatically, and you can save any solve and watch it back move by move
- Fully remappable keyboard controls (visual layer keys or R/U/F notation), cube colours, turn speed and camera
- No accounts, no server, no tracking: solves and replays live in your browser's IndexedDB, settings in localStorage

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build
pnpm deploy       # build + deploy dist/ to Cloudflare Pages (project "cubemonke")
```

Stack: React, TypeScript, Vite, Tailwind, three.js via react-three-fiber.

## Layout

```
src/
  app/                 routes and app shell
  components/cube/     the 3D cube and its animation
  hooks/keyboardShortcuts/   key chords → cube moves
  lib/data/local/      local storage layer (IndexedDB for solves and replays)
  lib/replays/         replay recording, compaction and playback
  pages/               play, replays, settings, your solves
```

## Ideas

More puzzles (Megaminx, Pyraminx, Skewb, mirror cube) are on the wish list. Contributions welcome.

## License

MIT
