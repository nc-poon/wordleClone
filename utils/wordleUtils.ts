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
    const targetLetters = target.split("");
    const guessLetters = guess.split("");

    // First pass: mark all correct (exact matches)
    const targetUsed = new Array(target.length).fill(false);

    for (let i = 0; i < guessLetters.length; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result.push({ letter: guessLetters[i], status: LETTER_STATUS.CORRECT });
            targetUsed[i] = true;
        } else {
            result.push({ letter: guessLetters[i], status: LETTER_STATUS.ABSENT }); // placeholder
        }
    }

    // Second pass: check for present letters (wrong position)
    for (let i = 0; i < guessLetters.length; i++) {
        if (result[i].status === LETTER_STATUS.ABSENT) { // not already correct, handle dups
            // Find unused matching letter in target
            for (let j = 0; j < targetLetters.length; j++) {
                if (!targetUsed[j] && guessLetters[i] === targetLetters[j]) {
                    result[i] = { letter: guessLetters[i], status: LETTER_STATUS.PRESENT };
                    targetUsed[j] = true;
                    break;
                }
            }
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
 * Validate if a word exists - check our list first, then API
 */
export async function isValidWord(word: string): Promise<boolean> {
    if (!isCorrectLength(word)) {
        return false;
    }

    // Check our word list first (fast)
    if (WORDS.includes(word)) {
        return true;
    }

    // If not in our list, check API
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return response.ok;
    } catch (error) {
        console.warn('Word validation API failed:', error);
        return true; // Allow word if API fails
    }
}

/**
 * Validate if a string is a valid 5-letter word
 */
export function isCorrectLength(word: string): boolean {
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


export type BotDifficulty = 'easy' | 'medium' | 'hard';

export class SmartBot {
    private correctLetters: { [pos: number]: string } = {};
    private presentLetters: Set<string> = new Set();
    private absentLetters: Set<string> = new Set();
    private triedPositions: Map<string, Set<number>> = new Map();
    private guessHistory: string[] = [];
    private difficulty: BotDifficulty;

    // Track letter frequency constraints
    private letterMinCount: Map<string, number> = new Map(); // minimum known count
    private letterMaxCount: Map<string, number> = new Map(); // maximum possible count

    constructor(difficulty: BotDifficulty = 'medium') {
        this.difficulty = difficulty;
        this.reset();
    }

    reset() {
        this.correctLetters = {};
        this.presentLetters = new Set();
        this.absentLetters = new Set();
        this.triedPositions = new Map();
        this.guessHistory = [];
        this.letterMinCount = new Map();
        this.letterMaxCount = new Map();
    }

    // Change bot difficulty
    setDifficulty(difficulty: BotDifficulty) {
        this.difficulty = difficulty;
        console.log(`SmartBot difficulty set to: ${difficulty}`);
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

    // Get next best guess using elimination strategy
    getNextGuess(guessCount: number): string {
        if (guessCount === 0) {
            return this.getFirstGuess();
        }

        // Build next guess strategically
        return this.buildStrategicGuess();
    }

    // Update constraints based on feedback
    updateConstraints(guess: string, result: LetterResult[]) {
        this.guessHistory.push(guess);
        console.log(`SmartBot updating constraints for guess: ${guess}`, result);

        // Count how many of each letter we found in this guess
        const foundCounts = new Map<string, number>();

        // First pass: count what we found and update correct positions
        for (let i = 0; i < result.length; i++) {
            const letter = result[i].letter;
            const status = result[i].status;

            if (status === "correct") {
                this.correctLetters[i] = letter;
                foundCounts.set(letter, (foundCounts.get(letter) || 0) + 1);
            } else if (status === "present") {
                foundCounts.set(letter, (foundCounts.get(letter) || 0) + 1);
            }
        }

        // Second pass: update letter status and constraints
        for (let i = 0; i < result.length; i++) {
            const letter = result[i].letter;
            const status = result[i].status;

            if (status === "correct") {
                // Remove from absent letters
                this.absentLetters.delete(letter);

                // Check if we need to remove from present letters
                const correctCount = Object.values(this.correctLetters).filter(l => l === letter).length;
                const minNeeded = this.letterMinCount.get(letter) || foundCounts.get(letter) || 1;

                // Only remove from present if we have enough correct positions for this letter
                if (correctCount >= minNeeded) {
                    this.presentLetters.delete(letter);
                    console.log(`  ${letter} removed from present - all instances accounted for`);
                }

                console.log(`  Correct: ${letter} at position ${i}`);

            } else if (status === "present") {
                this.presentLetters.add(letter);
                this.absentLetters.delete(letter);

                // Track failed positions
                if (!this.triedPositions.has(letter)) {
                    this.triedPositions.set(letter, new Set());
                }
                this.triedPositions.get(letter)!.add(i);
                console.log(`  Present: ${letter} not at position ${i}`);

            } else { // absent
                const totalFound = foundCounts.get(letter) || 0;
                const isKnownToExist = this.presentLetters.has(letter) ||
                    Object.values(this.correctLetters).includes(letter);

                if (totalFound === 0 && !isKnownToExist) {
                    this.absentLetters.add(letter);
                    this.letterMaxCount.set(letter, 0);
                    console.log(`  Absent: ${letter}`);
                }
            }
        }

        // Update letter frequency constraints
        this.updateLetterCounts(guess, result, foundCounts);

        console.log('Current bot knowledge:', this.getDebugInfo());
    }

    private updateLetterCounts(guess: string, result: LetterResult[], foundCounts: Map<string, number>) {
        // For each unique letter in the guess
        const uniqueLetters = new Set(guess.split(''));

        for (const letter of uniqueLetters) {
            const totalInGuess = guess.split('').filter(l => l === letter).length;
            const foundCount = foundCounts.get(letter) || 0;

            // Update minimum count (we know at least this many exist)
            const currentMin = this.letterMinCount.get(letter) || 0;
            this.letterMinCount.set(letter, Math.max(currentMin, foundCount));

            // Update maximum count if we hit the limit
            if (foundCount < totalInGuess) {
                // We tried more than we found, so we know the exact count
                this.letterMaxCount.set(letter, foundCount);
            }

            console.log(`  Letter ${letter}: min=${this.letterMinCount.get(letter)}, max=${this.letterMaxCount.get(letter) || 'unknown'}`);
        }
    }

    // Build a strategic guess based on known information
    private buildStrategicGuess(): string {
        // Check if bot should skip analysis based on difficulty
        const skipChances = {
            'easy': 0.3,   // 30% chance to skip analysis
            'medium': 0.2, // 20% chance to skip analysis  
            'hard': 0.0    // 0% chance to skip analysis
        };
        
        if (Math.random() < skipChances[this.difficulty]) {
            console.log(`SmartBot (${this.difficulty}) making random guess`);
            return getRandomWord();
        }

        const guess = ['', '', '', '', ''];
        const usedLetters = new Map<string, number>(); // track count of each letter used

        // First, place all known correct letters
        for (const pos in this.correctLetters) {
            const position = parseInt(pos);
            const letter = this.correctLetters[position];
            guess[position] = letter;
            usedLetters.set(letter, (usedLetters.get(letter) || 0) + 1);
        }

        // Now try to find a word from our list that fits the constraints
        const partialGuess = guess.join('');
        if (partialGuess.includes('')) {
            // Find words that match our constraints
            const candidateWords = WORDS.filter(word => {
                // Check if word matches known correct positions
                for (let pos = 0; pos < 5; pos++) {
                    if (guess[pos] !== '' && word[pos] !== guess[pos]) {
                        return false;
                    }
                }

                // Check if word contains required present letters
                for (const letter of this.presentLetters) {
                    if (!word.includes(letter)) {
                        return false;
                    }
                }

                // Check if word avoids absent letters
                for (const letter of this.absentLetters) {
                    if (word.includes(letter)) {
                        return false;
                    }
                }

                return true;
            });

            if (candidateWords.length > 0) {
                const result = candidateWords[Math.floor(Math.random() * candidateWords.length)];
                console.log('SmartBot strategic guess from word list:', result);
                return result;
            }
        }

        // Fill remaining positions with unused letters (fallback)
        for (let pos = 0; pos < 5; pos++) {
            if (guess[pos] === '') {
                const availableLetters = [];

                for (let charCode = 65; charCode <= 90; charCode++) {
                    const letter = String.fromCharCode(charCode);
                    const currentCount = usedLetters.get(letter) || 0;
                    const maxAllowed = this.letterMaxCount.get(letter);

                    // Skip if letter is known to be absent or we've used maximum allowed
                    if (!this.absentLetters.has(letter) &&
                        (maxAllowed === undefined || currentCount < maxAllowed)) {
                        availableLetters.push(letter);
                    }
                }

                if (availableLetters.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableLetters.length);
                    const selectedLetter = availableLetters[randomIndex];
                    guess[pos] = selectedLetter;
                    usedLetters.set(selectedLetter, (usedLetters.get(selectedLetter) || 0) + 1);
                }
            }
        }

        const result = guess.join('');
        console.log('SmartBot strategic guess:', result);
        return result || getRandomWord();
    }

    // Get debug information about bot's current knowledge
    getDebugInfo(): { correctLetters: any; presentLetters: string[]; absentLetters: string[]; triedPositions: any; letterMinCount: any; letterMaxCount: any } {
        return {
            correctLetters: this.correctLetters,
            presentLetters: Array.from(this.presentLetters),
            absentLetters: Array.from(this.absentLetters),
            triedPositions: Object.fromEntries(
                Array.from(this.triedPositions.entries()).map(([letter, positions]) => [
                    letter,
                    Array.from(positions)
                ])
            ),
            letterMinCount: Object.fromEntries(this.letterMinCount),
            letterMaxCount: Object.fromEntries(this.letterMaxCount)
        };
    }
}
