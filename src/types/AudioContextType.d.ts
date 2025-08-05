import type { RefObject } from "react";
import type { StateType } from "./States";
import type {
    AMSynth,
    FMSynth,
    MetalSynth,
    NoiseSynth,
    PluckSynth,
    PolySynth,
    Synth,
} from "tone";

export type AudioContextType = {
    // PONG
    hitSynth: RefObject<Synth | null>;
    scoreSynth: RefObject<Synth | null>;
    shrinkSynth: RefObject<NoiseSynth | null>;
    slowSynth: RefObject<Synth | null>;
    superShotApontar: RefObject<AMSynth | null>;
    superShotFogo: RefObject<Synth | null>;
    // Página
    movePage: RefObject<NoiseSynth | null>;
    moveMenu: RefObject<Synth | null>;
    // BREAKOUT
    powerUpDropSynth: RefObject<PolySynth | null>;
    bigPaddleSynth: RefObject<Synth | null>;
    explosionSynth: RefObject<NoiseSynth | null>;
    extraLifeSynth: RefObject<FMSynth | null>;
    multiballSynth: RefObject<PluckSynth | null>;
    barrierSynth: RefObject<MetalSynth | null>;
    brickBreakSynth: () => void;
    //Space Invaders
    playerShootSynth: React.RefObject<Synth | null>;
    bossAppearanceSynth: React.RefObject<FMSynth | null>;
    alienExplosionSound: () => void;
    bigExplosionSound: () => void;
    // Interface
    isMusic: StateType<boolean>;
    startAudio: () => void;
    playMusic: (type: "Pong" | "Breakout" | "Invaders") => void;
    stopMusic: () => void;
    pauseMusic: () => void;
};
