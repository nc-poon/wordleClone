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
