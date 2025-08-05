import { useEffect, useState } from "react";
import HeartIcon from "../Icons/HeartIcon";
import "./lifes.scss";

function Lifes({
    qtd = 0,
    game,
    pontosOponente,
    position,
    isMobile = false,
}: {
    qtd: number;
    game: string;
    pontosOponente?: { jogador: number; oponente: number };
    position?: number;
    isMobile?: boolean;
}) {
    const [lifes, setLifes] = useState(Array.from({ length: qtd }));

    useEffect(() => {
        if (qtd > lifes.length && lifes.length <= 10)
            setLifes(Array.from({ length: qtd }));
    }, [qtd]);

    return (
        <div
            className={`lifes  lifes__${game} ${
                isMobile ? "lifes--mobile" : ""
            }`}
            style={{ right: position }}
        >
            {pontosOponente
                ? lifes.map((v, i) => {
                      return (
                          <div
                              key={"life" + i}
                              className={`lifes__life ${
                                  i < pontosOponente.oponente ? "lost" : ""
                              }`}
                          >
                              <HeartIcon />
                          </div>
                      );
                  })
                : lifes.map((v, i) => {
                      return (
                          <div
                              key={"life" + i}
                              className={`lifes__life ${
                                  qtd <= i ? "lost" : ""
                              }`}
                          >
                              <HeartIcon />
                          </div>
                      );
                  })}
        </div>
    );
}

export default Lifes;
