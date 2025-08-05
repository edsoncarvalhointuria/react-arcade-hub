import {
    createContext,
    useContext,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { Synth } from "tone";
import type { AudioContextType } from "../types/AudioContextType";
import * as Tone from "tone";

export const toneContext = createContext<AudioContextType | null>(null);
export const useToneContext: () => AudioContextType = () =>
    useContext(toneContext)!;

function AudioProvider({ children }: PropsWithChildren<{}>) {
    const [isMusic, setIsMusic] = useState(false);
    const hitSynth = useRef<Synth>(null);
    const scoreSynth = useRef<Synth>(null);
    const shrinkSynth = useRef<Tone.NoiseSynth>(null);
    const slowSynth = useRef<Synth>(null);
    const superShotApontar = useRef<Tone.AMSynth>(null);
    const superShotFogo = useRef<Synth>(null);
    const musicPong = useRef<Tone.Player>(null);
    const musicBreakout = useRef<Tone.Player>(null);
    const musicInvaders = useRef<Tone.Player>(null);
    const movePage = useRef<Tone.NoiseSynth>(null);
    const moveMenu = useRef<Synth>(null);
    const brickBreakNoise = useRef<Tone.NoiseSynth>(null);
    const brickBreakPing = useRef<Tone.MembraneSynth>(null);
    const powerUpDropSynth = useRef<Tone.PolySynth>(null);
    const bigPaddleSynth = useRef<Tone.Synth>(null);
    const explosionSynth = useRef<Tone.NoiseSynth>(null);
    const extraLifeSynth = useRef<Tone.FMSynth | null>(null);
    const multiballSynth = useRef<Tone.PluckSynth | null>(null);
    const barrierSynth = useRef<Tone.MetalSynth | null>(null);
    const bossAppearanceSynth = useRef<Tone.FMSynth | null>(null);
    const playerShootSynth = useRef<Tone.Synth | null>(null);
    const isRunning = useRef(false);

    const toneMusic = async (localMusica: string) => {
        const player = new Tone.Player(localMusica).toDestination();
        await Tone.loaded();

        player.loop = true;
        player.volume.value = -10;
        player.sync();

        return player;
    };

    const startAudio = async () => {
        if (!isRunning.current) {
            isRunning.current = true;
            Tone.start();

            musicPong.current = await toneMusic("./battle-of-pogs.mp3");
            musicBreakout.current = await toneMusic(
                "./The-Pirate-And-The Dancer.mp3"
            );
            musicInvaders.current = await toneMusic("./8-Bit-Epic-Gameboy.mp3");

            setIsMusic(true);

            if (!hitSynth.current)
                hitSynth.current = new Synth().toDestination();

            if (!scoreSynth.current)
                scoreSynth.current = new Synth({
                    oscillator: { type: "triangle" },
                }).toDestination();

            if (!slowSynth.current) {
                slowSynth.current = new Tone.Synth({
                    oscillator: { type: "sine" },
                    envelope: {
                        attack: 0.5,
                        decay: 0.1,
                        sustain: 1,
                        release: 1,
                    },
                }).toDestination();
            }

            if (!shrinkSynth.current) {
                const noise = new Tone.NoiseSynth({
                    noise: { type: "pink" },
                    envelope: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 0.5,
                        release: 0.5,
                    },
                }).toDestination();
                // Adicionamos um filtro para "abafar" o som e não machucar os ouvidos
                const filter = new Tone.AutoFilter("3n")
                    .toDestination()
                    .start();
                noise.connect(filter);
                noise.volume.value = -10;
                shrinkSynth.current = noise;
            }

            if (!superShotApontar.current) {
                superShotApontar.current = new Tone.AMSynth({
                    harmonicity: 1.5,

                    envelope: { attack: 0.1, sustain: 1, release: 0.5 },
                    volume: 10,
                }).toDestination();
            }

            // Som de "disparo" de canhão para o Super Shot
            if (!superShotFogo.current) {
                const synth = new Tone.Synth({
                    oscillator: { type: "sine", volume: 10 },
                }).toDestination();
                // Um envelope de frequência que "cai" muito rápido para criar o "boom"
                const freqEnv = new Tone.FrequencyEnvelope({
                    attack: 0.01,
                    baseFrequency: "G2", // Começa grave
                    octaves: -3, // Cai 3 oitavas
                    release: 0.4,
                }).connect(synth.frequency);
                (synth as any).trigger = freqEnv;
                superShotFogo.current = synth;
            }

            // Som de "blip" para navegação no menu
            if (!moveMenu.current) {
                moveMenu.current = new Tone.Synth({
                    oscillator: { type: "square" },
                    envelope: {
                        attack: 0.005,
                        decay: 0.1,
                        sustain: 0,
                        release: 0.1,
                    },
                }).toDestination();
            }

            // Som de "whoosh" para troca de jogo
            if (!movePage.current) {
                const noise = new Tone.NoiseSynth({
                    noise: { type: "white" },
                    envelope: { attack: 0.005, decay: 0.2, sustain: 0 },
                }).toDestination();

                const filter = new Tone.AutoFilter("2n")
                    .toDestination()
                    .start();
                filter.baseFrequency = 400;
                filter.octaves = 4;
                noise.connect(filter);
                movePage.current = noise;
            }

            if (!brickBreakNoise.current) {
                brickBreakNoise.current = new Tone.NoiseSynth({
                    noise: { type: "white" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.05, // bem curto!
                        sustain: 0,
                    },
                }).toDestination();
            }

            // Um tom agudo metálico
            if (!brickBreakPing.current) {
                brickBreakPing.current = new Tone.MembraneSynth({
                    pitchDecay: 0.01,
                    octaves: 1,
                    oscillator: {
                        type: "sine",
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 0.1,
                        sustain: 0,
                        release: 0.01,
                    },
                }).toDestination();
            }

            // Som de "Baú do Zelda" para o drop do poder
            if (!powerUpDropSynth.current) {
                // PolySynth pode tocar acordes ou arpejos
                powerUpDropSynth.current = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "fatsawtooth" },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.2,
                        release: 0.2,
                    },
                }).toDestination();
            }

            // Som de "Revigoração" para a raquete gigante
            if (!bigPaddleSynth.current) {
                bigPaddleSynth.current = new Tone.Synth({
                    oscillator: { type: "pulse", width: 0.2 },
                    envelope: {
                        attack: 0.4,
                        decay: 0.1,
                        sustain: 0.8,
                        release: 0.5,
                    }, // Attack longo!
                }).toDestination();
            }

            // Som de "Explosão"
            if (!explosionSynth.current) {
                const noise = new Tone.NoiseSynth({
                    noise: { type: "brown" }, // Ruído mais grave
                    envelope: { attack: 0.01, decay: 0.5, sustain: 0 },
                }).toDestination();
                // Um filtro para dar o som de "boom" abafado
                const lowpass = new Tone.Filter(100, "lowpass").toDestination();
                noise.connect(lowpass);
                explosionSynth.current = noise;
            }

            // Som de "Flauta" para a vida extra
            if (!extraLifeSynth.current) {
                extraLifeSynth.current = new Tone.FMSynth({
                    harmonicity: 2,
                    modulationIndex: 10,
                    envelope: {
                        attack: 0.2,
                        decay: 0.3,
                        sustain: 0.1,
                        release: 1,
                    },
                    modulationEnvelope: {
                        attack: 0.01,
                        decay: 0.5,
                        sustain: 0,
                        release: 0.1,
                    },
                }).toDestination();
            }

            // Som de "Pipoca" para o multiball
            if (!multiballSynth.current) {
                multiballSynth.current = new Tone.PluckSynth({
                    attackNoise: 1,
                    dampening: 4000,
                    resonance: 0.9,
                }).toDestination();
            }

            // Som "Cyber" para a barreira
            if (!barrierSynth.current) {
                const synth = new Tone.MetalSynth({
                    envelope: { attack: 0.01, decay: 0.4, release: 0.2 },
                    harmonicity: 5.1,
                    modulationIndex: 32,
                    resonance: 4000,
                    octaves: 1.5,
                }).toDestination();
                synth.frequency.value = 100;
                const phaser = new Tone.Phaser({
                    frequency: 15,
                    octaves: 5,
                    baseFrequency: 1000,
                }).toDestination();
                synth.connect(phaser);
                barrierSynth.current = synth;
            }

            if (!playerShootSynth.current) {
                playerShootSynth.current = new Tone.Synth({
                    oscillator: { type: "square" },
                    envelope: {
                        attack: 0.005,
                        decay: 0.05,
                        sustain: 0,
                        release: 0.1,
                    },
                    volume: -10,
                }).toDestination();
            }

            // Som de "Suspense" para a aparição do chefe
            if (!bossAppearanceSynth.current) {
                bossAppearanceSynth.current = new Tone.FMSynth({
                    harmonicity: 0.5,
                    modulationIndex: 10,
                    envelope: {
                        attack: 1,
                        decay: 0.2,
                        sustain: 0.1,
                        release: 1,
                    }, // Attack bem longo!
                    modulationEnvelope: {
                        attack: 0.5,
                        decay: 0,
                        sustain: 1,
                        release: 0.5,
                    },
                }).toDestination();
            }
        }
    };

    const playMusic = (type: "Pong" | "Breakout" | "Invaders") => {
        switch (type) {
            case "Pong":
                musicBreakout.current?.stop();
                musicInvaders.current?.stop();
                musicPong.current?.start(0);
                break;
            case "Breakout":
                musicPong.current?.stop();
                musicInvaders.current?.stop();
                musicBreakout.current?.start(0);
                break;
            case "Invaders":
                musicPong.current?.stop();
                musicBreakout.current?.stop();
                musicInvaders.current?.start(0);
                break;
        }
        Tone.getTransport().start();
    };
    const stopMusic = () => {
        Tone.getTransport().stop();
    };
    const pauseMusic = () => {
        Tone.getTransport().pause();
    };

    const brickBreakSynth = () => {
        const brickBreakNoise = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: {
                attack: 0.001,
                decay: 0.05, // bem curto!
                sustain: 0,
            },
        }).toDestination();

        const brickBreakPing = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 1,
            oscillator: {
                type: "sine",
            },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0,
                release: 0.01,
            },
        }).toDestination();

        brickBreakNoise.triggerAttackRelease("8n");
        brickBreakPing.triggerAttackRelease("C2", "8n");
        setTimeout(() => {
            brickBreakNoise.dispose();
            brickBreakPing.dispose();
        }, 500);
    };

    // Som de "Pop" para a destruição do alien
    const alienExplosionSound = () => {
        const noise = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
            volume: -15,
        }).toDestination();
        noise.triggerAttackRelease("32n");
        setTimeout(() => noise.dispose(), 200);
    };

    // Som de "Boom" para a explosão da nave/chefe
    const bigExplosionSound = () => {
        const noise = new Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.01, decay: 0.4, sustain: 0 },
            volume: -5,
        }).toDestination();
        const thump = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4,
            },
            volume: 0,
        }).toDestination();

        noise.triggerAttackRelease("0.5s");
        thump.triggerAttackRelease("C1", "0.5s");
        setTimeout(() => {
            noise.dispose();
            thump.dispose();
        }, 2000);
    };

    const contextValue: AudioContextType = {
        hitSynth,
        scoreSynth,
        startAudio,
        shrinkSynth,
        slowSynth,
        superShotApontar,
        superShotFogo,
        moveMenu,
        movePage,
        powerUpDropSynth,
        bigPaddleSynth,
        explosionSynth,
        extraLifeSynth,
        multiballSynth,
        barrierSynth,
        playerShootSynth,
        bossAppearanceSynth,
        alienExplosionSound,
        bigExplosionSound,
        brickBreakSynth,
        playMusic,
        stopMusic,
        pauseMusic,
        isMusic,
    };

    return (
        <toneContext.Provider value={contextValue}>
            {children}
        </toneContext.Provider>
    );
}

export default AudioProvider;
