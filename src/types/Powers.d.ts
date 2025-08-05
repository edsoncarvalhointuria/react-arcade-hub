export type PowersPongType = {
    shrinkPower: { ativo: boolean; carga: number; tempoAnimacao: number };
    slowPower: { ativo: boolean; carga: number; tempoAnimacao: number };
    superShotPower: {
        status: "preparar" | "apontar" | "fogo";
        carga: number;
    };
};

export type PowersBreakoutNamesType =
    | "raquete_gigante"
    | "super_shot"
    | "multiball"
    | "mais_vida"
    | "explosao"
    | "barreira";

export type PowersBreakoutActiveType = {
    [key in PowersBreakoutNamesType]: boolean;
};
export type PowersBreakoutTimeType = {
    [key in PowersBreakoutNamesType]: number;
};

export type PowersInvadersNamesType =
    | "multi_shot"
    | "super_shot"
    | "explosive_shot"
    | "ricochetear"
    | "shield"
    | "mais_vida";

export type PowersInvadersActiveType = {
    [key in PowersInvadersNamesType]: boolean;
};
// export type EventPowerUpType
