import { WORD_LENGTH } from "@/gameConfigs";
import { KeyboardHandlerProps } from "@/types";

export const createKeyboardHandler = ({
  currentGuess,
  setCurrentGuess,
  gameOver,
  loading,
  onEnter,
}: KeyboardHandlerProps) => {
  return (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (gameOver || loading) return;

    if (e.key === "Enter") {
      onEnter();
    } else if (e.key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + e.key.toUpperCase());
    }
  };
};

export const createInputChangeHandler = (
  setCurrentGuess: (value: string | ((prev: string) => string)) => void
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGuess(e.target.value.toUpperCase().slice(0, WORD_LENGTH));
  };
};