---
name: mtg-event-report
description: Parse MTG standings screenshots into the Studio event-report data files, including player, host, and archetype records. Use when adding or correcting a reported event from an image.
---

# MTG Event Report

Add the event to the Studio data without changing unrelated report code or historical records.

## Data source and extraction

- Inspect `tools/studio/public/data/event-report/{events,players,archetypes,hosts}.json` and `tools/studio/src/images/event-report/schema.ts` before editing. Reuse existing IDs whenever the player, host, or archetype is already represented.
- Transcribe standings in screenshot rank order. Convert `W/L/D` into `result.wins`, `result.loses`, and, only when present, `result.draws`.
- Normalize a stated date to the existing `DD-MM-YYYY` format. Use an event ID of `<host-id>-pauper-YYYY-MM-DD` and name the event `Weekly Pauper` unless the user supplies a different event name.
- Add a new host only with its name and street address. If the screenshot/user does not establish the address, ask for it.
- Add missing players with lowercase kebab-case IDs and the best full-name capitalization supported by the source.

## Preview and approval

- For every new event, inspect and match the existing data first, but do not edit any event-report JSON yet.
- Output the parsed standings as a Markdown table with exactly these columns: `rank`, `name`, `deck`, `w/l/d`, `is player new`, and `is deck archetype new`. Keep screenshot labels in the `deck` column so the user can verify the parsing; use `yes` or `no` for the two new-record columns.
- State the proposed host, date, event ID, and event name with the preview. Identify any missing host address or unresolved archetype display names needed to add the event.
- Then wait for the user to explicitly approve the preview or provide corrections. Do not edit the data JSON files, add records, or run validation/rendering until approval is received.
- If the user corrects parsed standings, update and show the complete preview again, then wait for explicit approval. An approval may include the required display names for new archetypes and missing player/host details.

## Archetypes (after preview approval)

- Before adding each new archetype, ask the user for its display name. Group all unresolved new archetypes in one concise question; do not ask about archetypes already in `archetypes.json`.
- Use established Magic color naming in display names: use Ravnica guild names for two-color combinations (for example, `Azorius Familiars`, `Dimir Faeries`, `Rakdos Madness`, and `Golgari Gardens`), not abbreviations such as UW or UB. Use `Mono-<color>` for mono-color decks (for example, `Mono-U Faeries` and `Mono-R Dredge`).
- Preserve existing canonical records and their IDs, including legacy spelling in IDs. Do not create duplicate archetypes merely because a screenshot uses a shortened label such as `BG Gardens` or `GlintBlade`.
- Use a lowercase kebab-case ID derived from the approved display name. Retain a screenshot label as the display name only when the user has accepted it by leaving it uncorrected after being asked.

## Validation and render handoff

- Verify every new standing references an existing player, archetype, and host; confirm the standing count matches the screenshot. Run `pnpm --filter studio run ts:check` from the repository root.
- The report data directory is intentionally gitignored; mention this in the handoff if relevant.
- Always end a successful event-addition handoff with a ready-to-run report command. Treat paths as relative to `tools/studio`, save to `out/{event-id}.png`, and pass the actual event ID with `--props`. Default to `dark` mode unless the user requests light mode.
