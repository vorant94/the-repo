import dedent from "dedent";
import { getContext } from "./context.ts";

export function buildSystemPromptForChapter(
  chapterTitle: string,
  videoTitle?: string,
): string {
  const { debugDir } = getContext();

  const titleContext = videoTitle ? `Video: ${videoTitle}\n` : "";

  const debugContext = debugDir
    ? "In the end of analysis provide a short reasoning for how you came up to the your conclusion\n"
    : "";

  const debugExample = debugDir
    ? "Notes: (how you come up to the conclusion that result of the game is what you say)"
    : "";

  return dedent`
    ${titleContext}Chapter: ${chapterTitle}

    You are analyzing a chapter of a transcript from a Magic: The Gathering gameplay video. BE SHORT AND CONCISE!

    Transcript is formatted in a following way:

    ###
    chunk number
    chunk start timestamp --> chunk end timestamp
    chunk text
    ###

    example:

    ###
    62
    00:02:24,000 --> 00:02:27,760
    Hello, my name is Mike!
    ###

    This chapter represents a single match-up or influencer intro / outro for the video. Each chapter contains one match-up between two decks, with up to 3 games (best of 3 format). Player can mention

    If this chapter is an intro, outro, or other non-gameplay section without any actual games, IGNORE ALL FORMATTING AND ANALYSIS REQUIREMENTS and simply respond with "No games in this chapter".

    If games are present, extract information for this match-up:
    1. The player's deck archetype (usually presented in video title you are getting within system prompt, not only in transcript)
    2. The opponent's deck archetype (can be presented in chapter title you are getting within system prompt, not only in transcript)
    3. Game numbers (Game 1, Game 2, Game 3 - maximum 3 games per match-up)
    4. Result for each game if mentioned. either player won or player lost. don't say it from opponent view point meaning NO opponent won NEITHER opponent lost
    5. Timestamps of start and end of each game

    Neither player nor opponent deck's archetype can't be changed across different games of the same matchup. if you identified different archetypes, it is a sign of a mistake

    Between each game there is a moment of sideboarding, when player decides what to cut from deck and what to add. Also usually at the beginning of each game player will comment the starting hand he got, whether he keeps it or mulligans it.
    Use this hints to determine when each game starts and ends.

    If you are troubling to identify game results try to extrapolate this info from what you clearly understood so far, for example:
    - since match-up is best of 3 if you identified there were only two games it means they both were either win or loss, so if you succeeded to identify one of two games as win or loss, the result of the second is probably identical to result of first
    - since match-up is best of 3 if you identified there were all three games it means the first two can't have exact same result since if it were true, there would be no third game
    - you can try to identify game result by looking for common phrases like "i'm rekt", "gg", "opponent scoops", "i scoop", "we got there". but be careful as these phrases can indicate good / bad move during the game not necessarily indicating end of the game

    If opponent's deck archetype isn't explicitly mentioned in chapter title player can mention what he plays against but instead of mentioning deck archetype he can mention nickname of the opponent. Don't confuse one with another.

    Player can make multiple attempts of guessing opponent's deck archetype mentioning different deck names. Usually the last guess is a final one.

    DO NOT identify multiple different match-ups in a single chapter. There is only ONE match-up per chapter.

    Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

    Format your response clearly with each game on a separate line.

    ${debugContext}
    Here is a template for analysis you should follow:

    ###

    Player's deck: (Name of the deck / Unknown)
    Opponent's deck: (Opponent deck's name / Unknown)

    Game X:
      Starts at: (timestamp of start of the game)
      Ends at: (timestamp of end of the game)
      Result: (Player won / Player loss)

    ${debugExample}
    ###
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
