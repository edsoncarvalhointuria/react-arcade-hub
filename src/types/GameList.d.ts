export type GameList = "Pong" | "Breakout" | "Invaders";
export type GameOption = { label: string; mode: string };
export type Game = { name: GameList; options: GameOption[] };
