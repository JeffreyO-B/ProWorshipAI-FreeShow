# ProWorshipAI FreeShow Edition — simple operator shell (approved direction)

## Product ownership
This is **ProWorshipAI**, not a FreeShow interface with an addon. Keep FreeShow's presentation/rendering/output engines behind a new ProWorshipAI operator shell. The original Python/browser ProWorshipAI frontend is a behavioral reference, **not** a UI to embed in an iframe.

## Navigation: five top-level areas maximum
- **Service**: order of service, service item sequence, current/next item.
- **Bible**: Quick Bible, installed translations, favourites, Bible Stories, contextual references.
- **Songs**: songs list, sections, lyric slides, song audio.
- **Media**: images, video, backgrounds, PDF, PowerPoint.
- **AI**: live transcript, scripture/story/song suggestions, approval queue.

**Settings/Admin**, **Remote**, and **Outputs** are small utility actions; not always-visible panes. Do not duplicate Order of Service.

## Constant layout
- Left: context-sensitive searchable library for selected area (switches, not stacks).
- Centre: slide thumbnails / edit / current item.
- Right: Preview and Live, always recognisable and separated.
- Bottom: optional collapsed order-of-service timeline, only one instance, with clear current position.
- The interface should be navigable at 1280x720 and on an 8GB Windows PC without vertical navigation tabs requiring scrolling.

## UI principles
- Dark charcoal base, restrained ProWorshipAI purple accent. No full-purple panels. Use consistent spacing, concise labels and one clear primary action.
- Display **actual ProWorshipAI logo** once verified, not temporary PW/P lettering in final build.
- No popouts, placeholder buttons, tabs with no functional content, or two competing scripture libraries in final UI.
- A testable action must open a real item; Scripture Preview/Live must only be enabled when verse text is resolved from an installed translation.
- Preserve original Python AI logic and private translation packs; use FreeShow IPC adapters for projection.
- Do not modify or replace the original ProWorshipAI repo or data directory.
- Do not change the Electron app's persisted data identity until isolated data paths and migration tests are in place.

## Implementation gates
1. Map original frontend workflows and assets, identify its Python API and private assets.
2. Build one top-level shell with native FreeShow rendering (feature flag; keep fallback).
3. Wire Bible to genuine verse lookup and native Preview/Live, then replace FreeShow scripture navigation.
4. Bring Songs/Media/Service + AI through adapters.
5. Add branding, packaging, multi-display tests, 200/500MB file-load tests.
6. Remove old shell only after full workflow parity testing.

## What is verified now
FreeShow development launch succeeds on Windows. No working ProWorshipAI-to-FreeShow verse-text/output bridge is yet verified. Do not imply navigation-only code is full feature parity.
