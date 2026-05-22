# Deploy DickKicker to GitHub Pages

**Live game:** https://surinyury.github.io/dickkicker/

Repo: https://github.com/surinyury/dickkicker

---

## Update the live game

After editing files in `src/`, push to GitHub:

```powershell
cd "C:\Users\YurySurin\Music\Cursor project no1\dickkicker"
& "C:\Users\YurySurin\AppData\Local\Programs\Git\cmd\git.exe" add .
& "C:\Users\YurySurin\AppData\Local\Programs\Git\cmd\git.exe" -c user.name="YURY" -c user.email="surinyury@users.noreply.github.com" commit -m "Update game"
& "C:\Users\YurySurin\AppData\Local\Programs\Git\cmd\git.exe" push
```

GitHub Pages redeploys in ~1–2 minutes after each push.

Rebuild offline file (optional):

```powershell
node build-offline.js
```

---

## Notes

- Pages uses **classic deploy** from the `main` branch (root folder).
- The `.github/workflows/` file stays local only — GitHub token needs extra `workflow` scope to push Actions files. Classic Pages works without it.
