# DickKicker

80s black-and-white arcade game. Move the Converse sneaker and kick falling shapes. **80 levels.**

**Project folder:** `C:\Users\YurySurin\Music\Cursor project no1\dickkicker\`

---

## Play online (GitHub Pages)

Live game: **https://surinyury.github.io/dickkicker/**

See **[DEPLOY.md](DEPLOY.md)** if you need to update the live site.

---

## Play offline (no internet)

Double-click **`DickKicker-offline.html`** or **`PLAY-OFFLINE.bat`**.

Share **`DickKicker-offline.html`** as a single file (~1.9 MB).

---

## Develop locally

```powershell
cd "C:\Users\YurySurin\Music\Cursor project no1\dickkicker"
node serve.js
```

Open http://localhost:3456 — or double-click **`start.bat`**.

After code changes:

```powershell
node build-offline.js
```

---

## Controls

| Input | Action |
|-------|--------|
| Touch / drag (lower half) | Move sneaker |
| Arrow keys / A D | Move (desktop) |
| **\|\| PAUSE** | Pause / resume |
| Tap title | Start |

---

## Stability (levels 1–80)

- Object pool sized for level 80 (~400 objects)
- Scene cleanup on every level restart
- Miss detection fixed so levels cannot soft-lock
- Error guard in game loop prevents full crash

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Online / GitHub version |
| `DickKicker-offline.html` | Single-file offline share |
| `DEPLOY.md` | GitHub Pages instructions |
| `src/` | Game source |
| `assets/` | foot.png + dick.jpg artwork |
| `lib/phaser.min.js` | Game engine (bundled, no CDN) |
