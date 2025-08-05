import "./game-title.scss";
function GameTitle({ currentGame = "", gameState = "" }) {
    return (
        <h1
            className={`title title--${currentGame.toLowerCase()} title--${gameState}`}
        >
            {currentGame.toUpperCase()}
        </h1>
    );
}

export default GameTitle;
