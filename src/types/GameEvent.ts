import type { PowersBreakoutNamesType } from "./Powers";

export type GameEvent =
    | {
          evento: "power_up";
          infos: {
              type: PowersBreakoutNamesType;
              posX: number;
              posY: number;
          };
      }
    | {
          evento:
              | "vida_perdida"
              | "tijolo_quebrado"
              | "copia_destruida"
              | "super_shot_active";
          infos?: {
              type: PowersBreakoutNamesType;
              posX: number;
              posY: number;
          };
      };
