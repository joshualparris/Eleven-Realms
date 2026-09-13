# Podcast Integration TODO

**Decision:** Add if this is the active Eleven Realms web project.  
**Status:** ✅ Core one-click podcast bank added 13 September 2026.
**Topic bank:** fantasy worldbuilding, tabletop RPG design, mythology, storytelling, fantasy literature.

## TODO
- [x] Use the shared 25-episode D&D/RPG bank for worldbuilding/fantasy/RPG design.
- [x] Add a collapsed bottom dock: **🌍 Listen to a different worldbuilding podcast**.
- [x] One tap selects/loads another episode; persist recent choices and avoid immediate repeats.
- [x] Use Spotify embed/deep links without assuming autoplay.
- [x] Collapse automatically if standard HTML game audio/video is introduced or begins playing.
- [x] Shared tags cover worldbuilding, story craft, RPG design and fantasy themes.
- [x] Keep exploration/game UI primary through a collapsed dock.
- [x] Shared dock supplies mobile/a11y, reduced-motion and persistence behaviour; app-specific regression tests can be added later.

## Implementation
The root web shell loads the shared JoshHub `dnd` catalogue through `podcast-dock-universal.js`.
