import { useCallback, useEffect, useRef, useState } from "react";
import "./App.scss";
import Pong from "./components/games/Pong/Pong";
import MouseIcon from "./components/ui/Icons/MouseIcon";
import ArrowIcon from "./components/ui/Icons/ArrowIcon";
import Breakout from "./components/games/Breakout/Breakout";
import Invaders from "./components/games/Invaders/Invaders";
import type { Game, GameList } from "./types/GameList";
import type { StateType } from "./types/States";
import GameTitle from "./components/ui/tools/GameTitle";
import EscIcon from "./components/ui/Icons/EscIcon";
import GameOverEffects from "./components/ui/tools/GameOverEffects";
import type { RankingItemType, RankingType } from "./types/Ranking";
import {
    load,
    loadScoreFirebase,
    save,
    saveScoreFirebase,
} from "./utils/storage";
import HighScoreInput from "./components/ui/tools/HighScoreInput";
import Ranking from "./components/ui/tools/Ranking";
import { useToneContext } from "./contexts/AudioContext";
import SpaceIcon from "./components/ui/Icons/SpaceIcon";
import GitHubLink from "./components/ui/tools/GitHubLink";

function App() {
    const [currentGame, setCurrentGame] = useState<GameList>("Pong");
    const [currentOptionGame, setCurrentOptionGame] = useState(0);
    const [resetCounter, setResetCounter] = useState(0);
    const [isTransitioning, setTransitioning] = useState<boolean>(false);
    const [directionTransition, setDiretionTransition] = useState<
        "prev" | "next" | ""
    >("");
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [gameState, setGameState] = useState<StateType>("inicial");
    const [gameMode, setGameMode] = useState("");
    const [finalScore, setFinalScore] = useState(0);
    const [rankingLocalStorage, setRankingLocalStorage] = useState<
        RankingType[]
    >([]);
    const [rankingList, setRankingList] = useState<RankingItemType[]>([]);
    const gameStateRef = useRef<StateType>(gameState);
    const $gameOptionsRef = useRef<HTMLParagraphElement[]>([]);
    const {
        startAudio,
        playMusic,
        stopMusic,
        pauseMusic,
        moveMenu,
        movePage,
        isMusic,
    } = useToneContext();
    const games: Game[] = [
        {
            name: "Pong",
            options: [
                { label: "Modo Desafio", mode: "challenge" },
                { label: "Modo Infinito", mode: "infinite" },
                { label: "Modo Dark", mode: "dark" },
            ],
        },
        {
            name: "Breakout",
            options: [
                { label: "Modo Clássico", mode: "classic" },
                { label: "Modo Muralha", mode: "infinite" },
            ],
        },
        {
            name: "Invaders",
            options: [{ label: "Modo Invasão", mode: "infinite" }],
        },
    ];
    games.forEach((v) => v.options.push({ label: "Ranking", mode: "ranking" }));
    const navigateGame = (direction: "next" | "prev") => {
        if (isTransitioning) return;
        setTransitioning(true);
        const gamesList = games.map((v) => v.name);
        const currentIndex = gamesList.indexOf(currentGame);

        let nextIndex: number;
        if (direction === "next") {
            nextIndex = (currentIndex + 1) % games.length;
            setDiretionTransition(direction);
        } else if (direction === "prev") {
            nextIndex = (currentIndex - 1 + games.length) % games.length;
            setDiretionTransition(direction);
        }
        movePage.current?.triggerAttackRelease("0.2s");
        setTimeout(() => {
            setCurrentGame(gamesList[nextIndex]);
            setDiretionTransition("");
            setTransitioning(false);
        }, 1000);
    };
    const playPause = () => {
        if (gameState === "play") setGameState("pause");
        else if (gameState === "inicial" || gameState === "pause")
            setGameState("play");
    };
    const mensagemState = () => {
        if (gameState === "pause") return "Pause";
        if (gameState === "game-over-vitoria") return "Parabéns, Você Venceu!";
        if (gameState === "game-over-derrota") return "Você Perdeu :(";
        return "Clique para iniciar";
    };
    const onGameOver = useCallback(
        (jogadorVenceu: boolean, pontos?: number) => {
            if (gameMode === "infinite" && !jogadorVenceu) {
                if (rankingList.length < 10) {
                    setFinalScore(pontos!);
                    setGameState("adicionando-ranking");
                } else {
                    const record = rankingList.sort(
                        (a, b) => a.pontos - b.pontos
                    );
                    if (pontos! > record[0].pontos) {
                        setFinalScore(pontos!);
                        setGameState("adicionando-ranking");
                    } else setGameState("ranking");
                }
            } else if (jogadorVenceu) setGameState("game-over-vitoria");
            else setGameState("game-over-derrota");
        },
        [gameMode, rankingList]
    );
    const onSubmitScore = async (iniciais: string) => {
        // LocalStorage
        setRankingLocalStorage((current) => {
            const newList = structuredClone(current);
            const gameRanking = newList.find((v) => v.game === currentGame);
            const newScore: RankingItemType = { iniciais, pontos: finalScore };

            if (!gameRanking) {
                newList.push({ game: currentGame, ranking: [newScore] });
            } else {
                gameRanking.ranking.push(newScore);
                gameRanking.ranking.sort((a, b) => b.pontos - a.pontos);
                if (gameRanking.ranking.length > 10) gameRanking.ranking.pop();
            }

            return newList;
        });

        // Firebase
        saveScoreFirebase(currentGame, iniciais, finalScore).then(() =>
            loadScoreFirebase(currentGame).then(setRankingList)
        );

        setGameState("ranking");
    };

    useEffect(() => {
        loadScoreFirebase(currentGame).then(setRankingList);
    }, [currentGame]);
    useEffect(() => {
        if (rankingLocalStorage.length) save("ranking", rankingLocalStorage);
    }, [rankingLocalStorage]);
    useEffect(() => {
        gameStateRef.current = gameState;

        if (gameState === "play") {
            document.title = `Jogando ${currentGame}! - EDSON CARVALHO INTURIA`;
            if (currentGame === "Pong") playMusic("Pong");
            else if (currentGame === "Breakout") playMusic("Breakout");
            else if (currentGame === "Invaders") playMusic("Invaders");
        } else if (gameState === "pause") {
            document.title = `Pausado | ${currentGame} - EDSON CARVALHO INTURIA`;
            pauseMusic();
        } else {
            stopMusic();
            document.title = `Arcade Hub - EDSON CARVALHO INTURIA`;
        }
    }, [gameState, isMusic]);
    useEffect(() => {
        const el = $gameOptionsRef.current[currentOptionGame];
        setCursorPosition({ top: el.offsetTop, left: el.offsetLeft });
    }, [currentOptionGame, isTransitioning]);
    useEffect(() => {
        const keydown = (evt: KeyboardEvent) => {
            startAudio();
            if (gameStateRef.current === "inicial") {
                // ------ Próximo Jogo --------
                if (evt.key === "ArrowRight") {
                    navigateGame("next");
                } else if (evt.key === "ArrowLeft") {
                    navigateGame("prev");
                }

                // ------ Modo De Jogo --------
                if (evt.key === "ArrowUp") {
                    const total = games.find((v) => v.name === currentGame)!
                        .options.length;
                    const next = (currentOptionGame - 1 + total) % total;
                    moveMenu.current?.triggerAttackRelease("C5", "16n");
                    setCurrentOptionGame(next);
                } else if (evt.key === "ArrowDown") {
                    const total = games.find((v) => v.name === currentGame)!
                        .options.length;
                    const next = (currentOptionGame + 1) % total;
                    setCurrentOptionGame(next);
                    moveMenu.current?.triggerAttackRelease("C5", "16n");
                }

                // ------ Escolher modo de Jogo --------
                if (evt.key === "Enter") {
                    const gameMode = games.find((v) => v.name === currentGame)
                        ?.options[currentOptionGame].mode!;
                    setGameMode(gameMode);

                    if (gameMode !== "ranking") setGameState("play");
                    else {
                        setGameState("ranking");
                        loadScoreFirebase(currentGame).then(setRankingList);
                    }

                    startAudio();
                }
            }

            // ------ Sair do Jogo --------
            if (
                evt.key === "Escape" &&
                (gameStateRef.current === "pause" ||
                    gameStateRef.current === "ranking")
            ) {
                setGameState("inicial");
                setResetCounter((current) => current + 1);
            }
        };
        window.addEventListener("keydown", keydown);

        return () => window.removeEventListener("keydown", keydown);
    }, [currentGame, isTransitioning, currentOptionGame]);
    useEffect(() => {
        const ranking = load<RankingType[]>("ranking");
        if (ranking) {
            setRankingLocalStorage(ranking);
        }
    }, []);

    const gamesComponents = {
        Pong: Pong,
        Breakout: Breakout,
        Invaders: Invaders,
    };

    return (
        <>
            <div
                id="game-hub"
                onClick={() => {
                    if (gameState !== "inicial") playPause();
                    startAudio();
                }}
            >
                {games.map((game) => {
                    if (game.name === currentGame) {
                        const CurrentGameComponent = gamesComponents[game.name];
                        return (
                            <div
                                key={game.name}
                                className={`game-container ${directionTransition} ${
                                    currentGame === game.name &&
                                    !isTransitioning
                                        ? "show"
                                        : ""
                                } ${
                                    gameState !== "play"
                                        ? "game-container--pause"
                                        : ""
                                }`}
                            >
                                <CurrentGameComponent
                                    gameState={gameStateRef}
                                    visible={game.name === currentGame}
                                    mode={gameMode}
                                    onGameOver={onGameOver}
                                    key={resetCounter}
                                />
                            </div>
                        );
                    }
                })}

                <div
                    className={`state ${gameState === "play" ? "hidden" : ""}`}
                >
                    <GameTitle
                        currentGame={currentGame}
                        gameState={gameState}
                    />
                    {gameState === "game-over-vitoria" ||
                    gameState === "game-over-derrota" ||
                    gameState === "ranking" ? (
                        <GameOverEffects type={currentGame} state={gameState} />
                    ) : (
                        <></>
                    )}

                    <div className="state__container">
                        {gameState === "inicial" ? (
                            <>
                                <div
                                    className="state__arrow-select"
                                    style={{
                                        top: `${cursorPosition.top + 5}px`,
                                        left: `${cursorPosition.left - 40}px`,
                                    }}
                                >
                                    &#10148;
                                </div>
                                {games
                                    .find((v) => v.name === currentGame)
                                    ?.options.map((v, i) => (
                                        <p
                                            key={v.label}
                                            className={`state__option ${
                                                i === currentOptionGame
                                                    ? "select"
                                                    : ""
                                            } ${
                                                v.mode === "ranking"
                                                    ? "ranking"
                                                    : ""
                                            }
                                    `}
                                            onMouseOver={() => {
                                                setCurrentOptionGame(i);
                                                moveMenu.current?.triggerAttackRelease(
                                                    "C5",
                                                    "16n"
                                                );
                                            }}
                                            onClick={() => {
                                                startAudio();
                                                setGameMode(v.mode);
                                                if (v.mode !== "ranking")
                                                    setGameState("play");
                                                else {
                                                    setGameState("ranking");
                                                    loadScoreFirebase(
                                                        currentGame
                                                    ).then(setRankingList);
                                                }
                                            }}
                                            ref={(el) => {
                                                if (el)
                                                    $gameOptionsRef.current[i] =
                                                        el;
                                            }}
                                        >
                                            {v.label}
                                        </p>
                                    ))}
                            </>
                        ) : gameState !== "adicionando-ranking" &&
                          gameState !== "ranking" ? (
                            <>
                                <p className={`state__container--${gameState}`}>
                                    {mensagemState()}
                                </p>
                                {gameState !== "pause" &&
                                gameState !== "play" ? (
                                    <button
                                        className="state__container__jogar-novamente"
                                        onClick={() => {
                                            setResetCounter(
                                                (current) => current + 1
                                            );
                                            setGameState("inicial");
                                        }}
                                    >
                                        Jogar Novamente
                                    </button>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : gameState === "adicionando-ranking" ? (
                            <HighScoreInput
                                onSubmitScore={onSubmitScore}
                                pontos={finalScore}
                            />
                        ) : (
                            <Ranking
                                currentGame={currentGame}
                                rankingList={rankingList}
                            />
                        )}
                    </div>
                </div>

                <div
                    className={`instructions ${
                        gameState === "inicial" ||
                        gameState === "pause" ||
                        gameState === "ranking"
                            ? ""
                            : "hidden"
                    }`}
                >
                    <div
                        className={`instructions__controls ${
                            gameState === "pause" || gameState === "ranking"
                                ? "hidden"
                                : ""
                        }`}
                    >
                        {currentGame !== "Invaders" ? <MouseIcon /> : <></>}

                        {currentGame === "Invaders" ? (
                            <div className="instructions__help--arrows">
                                <ArrowIcon className={`left arrow--control`} />
                                <ArrowIcon className={`arrow--control`} />
                            </div>
                        ) : (
                            <></>
                        )}

                        {currentGame === "Breakout" ||
                        currentGame === "Invaders" ? (
                            <SpaceIcon />
                        ) : (
                            <></>
                        )}

                        <p className="instructions__controls--text">
                            Controles
                        </p>
                    </div>
                    <div
                        className={`instructions__help ${
                            gameState === "pause" || gameState === "ranking"
                                ? "hidden"
                                : ""
                        }`}
                    >
                        <p className="instructions__help--text">Próximo Jogo</p>
                        <div className="instructions__help--arrows">
                            <button onClick={() => navigateGame("prev")}>
                                <ArrowIcon
                                    className={`left ${
                                        directionTransition === "prev"
                                            ? "press"
                                            : ""
                                    }`}
                                />
                            </button>
                            <button onClick={() => navigateGame("next")}>
                                <ArrowIcon
                                    className={
                                        directionTransition === "next"
                                            ? "press"
                                            : ""
                                    }
                                />
                            </button>
                        </div>
                    </div>
                    <div
                        className={`instructions__controls esc ${
                            gameState !== "pause" && gameState !== "ranking"
                                ? "hidden"
                                : ""
                        }`}
                    >
                        <EscIcon />
                        <p className="instructions__controls--text">Sair</p>
                    </div>
                </div>
            </div>

            <GitHubLink />
        </>
    );
}

export default App;
