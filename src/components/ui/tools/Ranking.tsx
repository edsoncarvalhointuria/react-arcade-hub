import type { GameList } from "../../../types/GameList";
import type { RankingItemType } from "../../../types/Ranking";
import "./ranking.scss";

function Ranking({
    currentGame,
    rankingList,
}: {
    currentGame: GameList;
    rankingList: RankingItemType[];
}) {
    return (
        <div
            className={`ranking-screen ranking-game--${currentGame.toLowerCase()}`}
        >
            <table>
                <thead>
                    {rankingList.length ? (
                        <tr className="ranking-screen__head">
                            <th>Rank</th>
                            <th>Score</th>
                            <th>Name</th>
                        </tr>
                    ) : (
                        <></>
                    )}
                </thead>
                <tbody>
                    {rankingList.length ? (
                        rankingList
                            .sort((a, b) => b.pontos - a.pontos)
                            .map((v, i) => (
                                <tr
                                    key={i + 1 + " ranking"}
                                    className="ranking-screen__item"
                                >
                                    <td className="ranking-screen__item--rank">
                                        {i + 1}
                                    </td>
                                    <td className="ranking-screen__item--score">
                                        {v.pontos}
                                    </td>
                                    <td className="ranking-screen__item--name">
                                        {v.iniciais}
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td>Sem Ranking...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Ranking;
