# Podcast Integration TODO

**Decision:** Add to the active Eleven Realms web project.  
**Status:** ✅ Independent one-click podcast player added 16 September 2026.
**Topic bank:** fantasy worldbuilding, tabletop RPG design, mythology, storytelling, fantasy literature.

## TODO
- [x] Store the 25-episode D&D/RPG/worldbuilding bank directly inside Eleven Realms.
- [x] Add a collapsed bottom launcher: **🎧 Podcasts**.
- [x] One tap opens the player; **🌍 Different podcast** selects another episode and avoids immediate repeats.
- [x] Persist the current selection locally.
- [x] Use direct Spotify embeds/deep links without assuming autoplay.
- [x] Keep exploration/game UI primary through a collapsed launcher.
- [x] Keep the implementation independent of JoshHub, jsDelivr, shared launcher scripts and remote podcast JSON.

## Implementation
The root web shell loads `/podcast-player.js` from this repository. The episode catalogue, player UI, selection logic and persistence all live inside Eleven Realms, so a failure in another app's podcast implementation cannot break this one.
