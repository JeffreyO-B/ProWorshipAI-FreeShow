# ProWorshipAI feature migration — source of truth

This edition retains FreeShow's UI, media pipeline, output engine, PPT/PDF import architecture and remote framework. ProWorshipAI owns the workflows for scriptures, Bible Stories, AI, song controls, and administration. Do not import proprietary Bible/song assets into the public repository.

## Feature acceptance criteria

| Domain | ProWorshipAI behavior to preserve | Integration boundary |
|---|---|---|
| Scriptures | Quick Bible with autocomplete; ranges/chapters; default KJV; six favourites; editable translation switch; preview and live | Replace the user-facing native scripture workflow, reusing output/slide rendering |
| Bible Stories | Categorised searchable index, custom stories, transcript story recognition, preview/queue | Shared scripture projection path |
| AI | Streaming transcript, contextual Top 3 scriptures/stories, AI song matches, approval queue, Ollama locally | Python sidecar; user-approved projection only |
| Songs | Private library, lyric thumbnails, live song sections, cursor/Enter navigation, music linked to song | Native FreeShow show model and audio engine |
| Media | Video preview/live, sound/mute, backgrounds apply-all, PPT/PDF thumbnails and controls, On Screen Now | Native FreeShow renderer and media import |
| Outputs | 2 projectors + monitor + laptop in extended/duplicated setup; up to 4–5 intended outputs | Native FreeShow output system |
| Remote | Mobile controls for scriptures, songs, slides, media, projection | Native remote server with access control |
| Admin | Bible/songs/models/settings/favourites, import/export and backups | Dedicated ProWorshipAI settings area |
| Branding | Original logo/icon, taskbar, splash, title, installer and separate user-data identity | Do not overwrite legacy ProWorshipAI data |

## Performance acceptance tests

- PDF and PPTX import tests: 50 MB, 200 MB, and 500 MB representative files; report load time, peak memory, navigation latency and failure modes. No unverified capacity promise.
- Test projector and output content only after preview/approval; do not project AI guesses automatically.
- Compare existing original app journeys and build one parity test for each before considering migration complete.
- Preserve GPL notices and licensing, and only distribute third-party Bible/media assets when authorised.

## Current reality

FreeShow launches in development. ProWorshipAI branding text and on-demand bridge health UI exist. The legacy Python backend, private Bible/song libraries, logo and icon files have NOT yet been integrated. Native FreeShow scriptures have NOT yet been replaced.

## Next implementation batch

1. Inspect exact original application assets and Python endpoints (not just descriptions).
2. Add scripture domain adapters (search/range/version/story) and UI that calls them.
3. Connect approved scripture selections to FreeShow preview/output API.
4. Implement tests for scripture selection, translations, multiple verses and output.
