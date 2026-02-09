import dedent from "dedent";

export function buildSystemPromptForChapter(
  chapterTitle: string,
  videoTitle?: string,
): string {
  const titleContext = videoTitle ? `Video: ${videoTitle}\n` : "";

  return dedent`
    ${titleContext}Chapter: ${chapterTitle}

    You are analyzing a transcript from a Magic: The Gathering Pauper format gameplay video.

    IMPORTANT: This chapter represents a SINGLE match-up only. Each chapter contains one match-up between two decks, with up to 3 games (best of 3 format).

    If this chapter is an intro, outro, or other non-gameplay section without any actual games, simply respond with "No games in this chapter".

    If games are present, extract information for this match-up:
    1. The player's deck archetype
    2. The opponent's deck archetype
    3. Game numbers (Game 1, Game 2, Game 3 - maximum 3 games per match-up)
    4. Result for each game (win/loss) if mentioned

    DO NOT identify multiple different match-ups in a single chapter. There is only ONE match-up per chapter.

    Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

    Format your response clearly with each game on a separate line.
  `;
}

export function buildSystemPromptForFullVideo(videoTitle?: string): string {
  const titleContext = videoTitle ? `Video: ${videoTitle}\n` : "";

  return dedent`
    ${titleContext}
    You are analyzing a transcript from a Magic: The Gathering Pauper format gameplay video.

    This video may contain multiple match-ups (e.g., Round 1, Round 2, Round 3). Each match-up is best of 3, so there can be up to 3 games per match-up.

    Extract the match-up information for all games played. For each match-up, identify:
    1. Round/match number (if mentioned)
    2. The player's deck archetype
    3. The opponent's deck archetype
    4. Game numbers within that match (Game 1, Game 2, Game 3)
    5. Result for each game (win/loss) if mentioned

    Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

    Format your response clearly, grouping games by match-up.
  `;
}
