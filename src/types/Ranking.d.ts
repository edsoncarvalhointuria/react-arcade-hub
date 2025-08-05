import type { GameList } from "./GameList";

export type RankingItemType = { iniciais: string; pontos: number };
export type RankingType = { game: GameList; ranking: RankingItemType[] };
