# ProWorshipAI — FreeShow Edition

This branch is the **separate** ProWorshipAI integration track, based on the FreeShow fork. Do not alter the legacy `JeffreyO-B/ProWorshipAI` repository or its installed app.

## First integration: local AI bridge client

`src/frontend/proworship/bridge.ts` adds a typed, read-only client for an optional localhost health endpoint (`http://127.0.0.1:8765/health`). It does **not** auto-launch Python, call Ollama, modify FreeShow output, or copy private Bible/song data. It isn't wired into a FreeShow UI yet.

Next steps:
1. Verify the FreeShow development window works (`npm start`).
2. Confirm the existing private backend API contract before adapting its endpoints.
3. Add a small on-demand connection UI to FreeShow, preferably in a new extension panel.
4. Integrate transcription and AI suggestions with explicit preview/approval before projection.
5. Port Quick Bible, Bible Stories, song/audio links, remote, video and Admin incrementally.

## Development

On Windows:

```powershell
cd "$HOME\Desktop\ProWorshipAI-FreeShow"
git fetch origin
git switch feature/proworshipai-ai-bridge
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm start
```

Existing upstream Svelte typecheck warnings/errors are **not** assumed resolved by this change. All source redistribution must comply with FreeShow's GPL-3.0 licensing, and private media/Bible/song packs must remain out of Git.
