export interface LetterResult {
    letter: string;
    status: "correct" | "present" | "absent";
}

export const WORDS = [
    "HELLO", "WORLD", "QUITE", "FANCY", "FRESH", "PANIC", "CRAZY", "BUGGY"
];
export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;


/**
 * Check a guess against the target word
 * Returns array of letter results with their status
 */
export function checkGuess(guess: string, target: string): LetterResult[] {
    if (!guess || !target) {
        console.error('invalid inputs:', { guess, target });
        return [];
    }
    const result: LetterResult[] = [];
    // into array of single char
    const targetLetters = target.split("");
    const guessLetters = guess.split("");
    // loop both and check each element
    for (let i = 0; i < guessLetters.length; i++) {
        // same value same pos
        if (guessLetters[i] === targetLetters[i]) {
            result.push({ letter: guessLetters[i], status: "correct" });
            // same value dif pos
        } else if (targetLetters.includes(guessLetters[i])) {
            result.push({ letter: guessLetters[i], status: "present" });
        } else {
            result.push({ letter: guessLetters[i], status: "absent" });
        }
    }
    return result;
}


//  Get random word from the word list
export function getRandomWord(): string {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// Check if game is over (won or max guesses reached)
export function isGameOver(guesses: string[], won: boolean): boolean {
    return won || guesses.length >= MAX_GUESSES;
}

// Check if player has won
export function hasWon(guess: string, targetWord: string): boolean {
    return guess === targetWord;
}


/**
 * Find candidate words for Absurdle mode
 * Returns words that would give the least helpful feedback
 */
export function findAbsurdleCandidates(guess: string, candidates: string[]): string[] {

    // check result for all words and record correct,present count and allabsent
    const wordsWithScores = candidates.map((word) => {
        const result = checkGuess(guess, word);
        const correctCount = result.filter((r) => r.status === "correct").length;
        const presentCount = result.filter((r) => r.status === "present").length;
        const allAbsent = result.every((r) => r.status === "absent");

        return {
            word,
            correctCount,
            presentCount,
            allAbsent,
        };
    });

    // If there are words with all absent, return them
    const allAbsentWords = wordsWithScores.filter((w) => w.allAbsent);
    if (allAbsentWords.length > 0) {
        return allAbsentWords.map((w) => w.word);
    }

    // No words with all absent, so apply hierarchy and return only 1 word
    // Sort by hierarchy: fewer correct first, then fewer present if correct counts are equal
    wordsWithScores.sort((a, b) => {
        if (a.correctCount !== b.correctCount) {
            return a.correctCount - b.correctCount; // fewer correct first
        }
        return a.presentCount - b.presentCount; // fewer present if correct counts are equal
    });

    // Return only the first word (best according to hierarchy)
    return [wordsWithScores[0].word];
}