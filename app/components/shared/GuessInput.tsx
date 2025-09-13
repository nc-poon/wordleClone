import React from "react";
import { WORD_LENGTH } from "@/gameConfigs";
import { GuessInputProps } from "@/types";
import "./GuessInput.css";

export default function GuessInput({
  currentGuess,
  onInputChange,
  onSubmit,
  gameOver,
  loading,
  disabled = false,
  submitButtonText = "Submit Guess",
  placeholder = "Enter your guess...",
}: GuessInputProps) {
  const isSubmitDisabled =
    currentGuess.length !== WORD_LENGTH || gameOver || loading || disabled;

  const isSubmitActive =
    currentGuess.length === WORD_LENGTH && !gameOver && !loading && !disabled;

  return (
    <div className="input-section mb-6">
      <div className="current-guess-input mb-4">
        <input
          type="text"
          value={currentGuess}
          onChange={onInputChange}
          maxLength={WORD_LENGTH}
          className="guess-input"
          placeholder={placeholder}
          disabled={gameOver || loading}
          autoFocus
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        className={`submit-button ${isSubmitActive ? "active" : "disabled"}`}
      >
        <span className="button-content">
          {loading ? (
            <>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </>
          ) : (
            submitButtonText
          )}
        </span>
      </button>
    </div>
  );
}
