---
name: mtg-event-report
description: Parse MTG standings screenshots into a Meta Forge event-report CSV. Use when preparing an event report for Meta Forge import.
---

# MTG Event Report

Prepare a CSV for Meta Forge's event-report import. Do not modify Studio data, generate Studio renders, or change Meta Forge data or code.

## Data source and extraction

- Use the standings screenshot and event details supplied by the user. Do not inspect or update `tools/studio` data files.
- Transcribe standings in rank order. Use the best full-name capitalization supported by the source.
- Use the archetype name supplied by the user or screenshot. Ask for a clear archetype name only when the supplied label is ambiguous enough to make the CSV unreliable.
- Convert each W/L/D record to numeric `wins`, `losses`, and `draws`. Use `0` for draws when the source omits them.
- Record a requested hidden archetype on that rank with `isArchetypeHidden` set to `true`; otherwise use `false`.
- Meta Forge requires an existing host. Ask for the host name if it is missing, and tell the user to create the host separately if they indicate it does not exist.
- Collect the event name and ISO 8601 date-time with an offset for the import form. Default the event name to `Weekly Pauper` only when the user does not supply one.

## Preview and approval

- Before producing the final CSV, show the parsed standings in a Markdown table with exactly these columns: `rank`, `player`, `archetype`, `wins`, `losses`, `draws`, and `is archetype hidden`.
- State the proposed event name, host name, and event date-time alongside the preview.
- Wait for explicit approval or corrections. Do not create database records or edit application files.

## CSV handoff

- After approval, save the CSV in the repository root as `event-report-YYYY-MM-DD-<host-slug>.csv`, using the event's local date and a lowercase kebab-case host slug. Do this automatically; do not wait for a separate request to create the file.
- Return the saved file as a clickable link and include its contents in a fenced `csv` block with this exact header and order: `rank,player,archetype,wins,losses,draws,isArchetypeHidden`.
- Include all seven columns for every row, including `draws` with `0` where appropriate and `isArchetypeHidden` as lowercase `true` or `false`. Quote CSV values when required by CSV syntax.
- Do not include IDs, host details, event details, or extra columns in the CSV. The import form receives `eventName`, `hostName`, and `eventDate` separately.
- Provide a ready-to-run `curl` snippet that imports the saved file with `POST https://meta-forge.vorant94.dev/api/event-reports/`. Use multipart fields `eventName`, `hostName`, `eventDate`, and `report`, and authenticate with `Authorization: Bearer ${META_FORGE_TOKEN}`. Do not execute the import unless the user explicitly asks.
- State that Meta Forge creates missing players and archetypes during import, but rejects an unknown host.
