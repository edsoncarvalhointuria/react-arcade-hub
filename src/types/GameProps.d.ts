import type { Ref, RefObject, SetStateAction } from "react";
import type { StateType } from "./States";

export type GameProps = {
    visible: boolean;
    gameState: RefObject<StateType>;
    mode: string;
    onGameOver: (jogadorVenceu: boolean, pontos?: number) => void;
};

export type PongProps = {
    visible: boolean;
};
