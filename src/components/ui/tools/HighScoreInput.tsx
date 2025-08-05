import { useEffect, useState } from "react";
import "./high-socore-input.scss";
import EnterIcon from "../Icons/EnterIcon";

function HighScoreInput({
    pontos,
    onSubmitScore,
}: {
    pontos: number;
    onSubmitScore: Function;
}) {
    const [letters, setLetters] = useState(["A", "A", "A"]);
    const [currentLetter, setCurrentLetter] = useState(0);
    const [keyPress, setKeyPress] = useState<"up" | "down" | "">("");
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    useEffect(() => {
        const keydown = (evt: KeyboardEvent) => {
            if (evt.key === "ArrowUp") {
                setLetters((current) => {
                    const lettersCopy = [...current];
                    const i = ALPHABET.indexOf(current[currentLetter]);
                    const nextIndex = (i + 1) % ALPHABET.length;
                    lettersCopy[currentLetter] = ALPHABET[nextIndex];
                    setKeyPress("up");
                    return lettersCopy;
                });
            } else if (evt.key === "ArrowDown") {
                setLetters((current) => {
                    const lettersCopy = [...current];
                    const i = ALPHABET.indexOf(current[currentLetter]);
                    const nextIndex =
                        (i - 1 + ALPHABET.length) % ALPHABET.length;
                    lettersCopy[currentLetter] = ALPHABET[nextIndex];
                    setKeyPress("down");
                    return lettersCopy;
                });
            } else if (evt.key === "ArrowLeft") {
                setCurrentLetter(
                    (v) => (v - 1 + letters.length) % letters.length
                );
                setKeyPress("");
            } else if (evt.key === "ArrowRight") {
                setCurrentLetter((v) => (v + 1) % letters.length);
                setKeyPress("");
            } else if (evt.key === "Enter") {
                onSubmitScore(letters);
            }
        };

        window.addEventListener("keydown", keydown);

        return () => {
            window.removeEventListener("keydown", keydown);
        };
    }, [letters, currentLetter]);

    return (
        <div className="high-score">
            <div className="high-score__pontos">
                Pontos: <span>{pontos}</span>
            </div>

            <div className="high-score__letras">
                {letters.map((v, i) => (
                    <div
                        key={i}
                        className={`high-score__letra ${
                            currentLetter === i ? `active` : ""
                        }`}
                        onClick={() => setCurrentLetter(i)}
                    >
                        <div
                            onClick={() => {
                                const fakeEvent = new KeyboardEvent("keydown", {
                                    key: "ArrowUp",
                                    code: "ArrowUp",
                                });
                                window.dispatchEvent(fakeEvent);
                            }}
                            className={`high-score__letra-seta-cima ${keyPress}`}
                        ></div>
                        {v}
                        <div
                            onClick={() => {
                                const fakeEvent = new KeyboardEvent("keydown", {
                                    key: "ArrowDown",
                                    code: "ArrowDown",
                                });
                                window.dispatchEvent(fakeEvent);
                            }}
                            className={`high-score__letra-seta-baixo ${keyPress}`}
                        ></div>
                    </div>
                ))}
            </div>

            <div
                className="high-score__salvar"
                style={{
                    top: window.innerHeight * 0.35,
                    left: window.innerWidth * 0.3,
                }}
                onClick={() => {
                    const fakeEvent = new KeyboardEvent("keydown", {
                        key: "Enter",
                        code: "Enter",
                    });
                    window.dispatchEvent(fakeEvent);
                }}
            >
                <EnterIcon />
                <p>Salvar</p>
            </div>
        </div>
    );
}

export default HighScoreInput;
