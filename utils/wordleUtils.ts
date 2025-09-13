import { LETTER_STATUS } from "@/constants";
import { WORDS, MAX_GUESSES, WORD_LENGTH } from "@/gameConfigs";
import { LetterResult } from "@/types";

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
            result.push({ letter: guessLetters[i], status: LETTER_STATUS.CORRECT });
            // same value dif pos
        } else if (targetLetters.includes(guessLetters[i])) {
            result.push({ letter: guessLetters[i], status: LETTER_STATUS.PRESENT });
        } else {
            result.push({ letter: guessLetters[i], status: LETTER_STATUS.ABSENT });
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

/**
 * Validate if a string is a valid 5-letter word
 */
export function isValidWord(word: string): boolean {
    return word.length === WORD_LENGTH && /^[A-Z]{5}$/.test(word);
}

/**
* Calculate score based on correct (2x) and present (1x) letters
*/
export function calculateScore(guesses: string[], target: string): number {
    let totalScore = 0;

    for (const guess of guesses) {
        const result = checkGuess(guess, target);
        for (const letterResult of result) {
            if (letterResult.status === "correct") {
                totalScore += 2;
            } else if (letterResult.status === "present") {
                totalScore += 1;
            }
        }
    }

    return totalScore;
}


export class SmartBot {
    private correctLetters: { [pos: number]: string } = {};
    private presentLetters: Set<string> = new Set();
    private absentLetters: Set<string> = new Set();
    private triedPositions: Map<string, Set<number>> = new Map();
    private guessHistory: string[] = [];

    // init
    constructor() {
        this.reset();
    }

    reset() {
        this.correctLetters = {};
        this.presentLetters = new Set();
        this.absentLetters = new Set();
        this.triedPositions = new Map(); // value and position
        this.guessHistory = [];
    }

    // Generate best first guess (vowel-heavy strategy)
    getFirstGuess(): string {
        // Priority: Try to get as many vowels as possible in first guess
        const vowelWords = ['ADIEU', 'AUDIO', 'OUIJA', 'AROSE', 'IRATE'];

        // Return the first vowel-heavy word
        const firstGuess = vowelWords[0];
        console.log('SmartBot first guess:', firstGuess);
        return firstGuess;
    }

    // Update constraints based on feedback
    updateConstraints(guess: string, result: LetterResult[]) {
        this.guessHistory.push(guess);
        console.log(`SmartBot updating constraints for guess: ${guess}`, result);

        for (let i = 0; i < result.length; i++) {
            const letter = result[i].letter;
            const status = result[i].status;

            if (status === "correct") {
                // Letter is in correct position
                this.correctLetters[i] = letter;
                console.log(`  Correct: ${letter} at position ${i}`);

            } else if (status === "present") {
                // Letter exists but wrong position
                this.presentLetters.add(letter);

                // Track that this position doesn't work for this letter
                if (!this.triedPositions.has(letter)) {
                    this.triedPositions.set(letter, new Set());
                }
                this.triedPositions.get(letter)!.add(i);
                console.log(`  Present: ${letter} not at position ${i}`);

            } else {
                // Letter doesn't exist (unless we know it exists from other positions)
                if (!this.presentLetters.has(letter)) {
                    this.absentLetters.add(letter);
                    console.log(`  Absent: ${letter}`);
                }
            }
        }

        console.log('Current bot knowledge:', this.getDebugInfo());
    }


    // Get next best guess using elimination strategy
    getNextGuess(guessCount: number): string {
        if (guessCount === 0) {
            return this.getFirstGuess();
        }

        // Build next guess strategically
        return this.buildStrategicGuess();
    }

    // Build a strategic guess based on known information
    private buildStrategicGuess(): string {
        const guess = ['', '', '', '', ''];
        const usedLetters = new Set<string>();

        // First, place all known correct letters
        for (const pos in this.correctLetters) {
            const position = parseInt(pos);
            const letter = this.correctLetters[position];
            guess[position] = letter;
            usedLetters.add(letter);
        }

        // Then, for correct value wrong pos try new pos
        for (const letter of this.presentLetters) {
            const triedPositions = this.triedPositions.get(letter) || new Set();

            // Find an empty position that hasn't been tried
            for (let pos = 0; pos < 5; pos++) {
                if (guess[pos] === '' && !triedPositions.has(pos)) {
                    guess[pos] = letter;
                    usedLetters.add(letter);
                    break;
                }
            }
        }

        // Fill remaining positions char not in absent list
        for (let pos = 0; pos < 5; pos++) {
            if (guess[pos] === '') {
                const availableLetters = [];
                for (let charCode = 65; charCode <= 90; charCode++) { // A=65 to Z=90
                    const letter = String.fromCharCode(charCode);
                    if (!this.absentLetters.has(letter)) {
                        availableLetters.push(letter);
                    }
                }

                // Pick a random available char
                if (availableLetters.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableLetters.length);
                    const selectedLetter = availableLetters[randomIndex];
                    guess[pos] = selectedLetter;
                }
            }
        }

        const result = guess.join(''); // join the char to string
        console.log('SmartBot strategic guess:', result);
        return result || getRandomWord();
    }

    // Get debug information about bot's current knowledge
    getDebugInfo(): { correctLetters: any; presentLetters: string[]; absentLetters: string[]; triedPositions: any } {
        return {
            correctLetters: this.correctLetters,
            presentLetters: Array.from(this.presentLetters),
            absentLetters: Array.from(this.absentLetters),
            triedPositions: Object.fromEntries(
                Array.from(this.triedPositions.entries()).map(([letter, positions]) => [
                    letter,
                    Array.from(positions)
                ])
            )
        };
    }
}
