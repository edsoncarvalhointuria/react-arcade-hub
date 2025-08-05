import "./game-title.scss";
function GameTitle({ currentGame = "", isRanking = false }) {
    return (
        <h1
            className={`title title--${currentGame.toLowerCase()} ${
                isRanking ? "title--ranking" : ""
            }`}
        >
            {currentGame.toUpperCase()}
        </h1>
    );
}

export default GameTitle;
