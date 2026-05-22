# Deploy DickKicker to GitHub Pages

Your game URL will be:

**`https://<your-github-username>.github.io/dickkicker/`**

---

## One-time setup (about 5 minutes)

### 1. Create a GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: **`dickkicker`**
3. Public repo
4. Do **not** add README (you already have one)
5. Click **Create repository**

### 2. Upload this folder

**Option A — GitHub website (easiest if you don't use git)**

1. On the new repo page, click **Add file → Upload files**
2. Drag in everything from this `dickkicker` folder **except**:
   - `DickKicker-offline.html` (too large; offline-only)
3. Commit

**Option B — Git on your PC**

```powershell
cd "C:\Users\YurySurin\Music\Cursor project no1\dickkicker"
git init
git add .
git commit -m "DickKicker online game"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/dickkicker.git
git push -u origin main
```

### 3. Turn on GitHub Pages

1. Repo → **Settings** → **Pages**
2. Under **Build and deployment**:
   - Source: **GitHub Actions**
3. Save

### 4. Wait for deploy

1. Repo → **Actions** tab
2. Wait for **Deploy to GitHub Pages** to finish (green check)
3. Open the URL shown in Settings → Pages

---

## After you edit the game

1. Change files in `src/`
2. Push / upload to GitHub again
3. Actions redeploys automatically in ~1 minute

Rebuild offline file locally (optional):

```powershell
node build-offline.js
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page | Hard refresh (Ctrl+Shift+R). Check Actions log for errors. |
| 404 on assets | Ensure `assets/`, `lib/`, `src/` were uploaded. |
| Game crashes late | Update to latest code; stability fixes target all 80 levels. |
