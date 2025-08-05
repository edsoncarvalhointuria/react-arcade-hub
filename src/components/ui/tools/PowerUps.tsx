import type { PowersPongType } from "../../../types/Powers";
import "./power-ups.scss";
import ShrinkIcon from "../Icons/ShrinkIcon";
import SlowIcon from "../Icons/SlowIcon";
import SuperShotIcon from "../Icons/SuperShotIcon";
import { useEffect, useRef, useState } from "react";

function PowerUps({
    powers,
    isDarkMode = false,
    isMobile = false,
    height,
}: {
    powers: PowersPongType;
    isDarkMode: boolean;
    height?: number | string;
    isMobile?: boolean;
}) {
    const powersRef = useRef(powers);
    const idTimeout = useRef<ReturnType<typeof setTimeout>>(null);
    const [powersFlash, setPowersFlash] = useState({
        shrinkPower: true,
        slowPower: true,
        superShotPower: true,
    });
    useEffect(() => {
        (Object.keys(powers) as Array<keyof PowersPongType>).forEach((v) => {
            if (powers[v].carga > powersRef.current[v].carga) {
                setPowersFlash((current) => ({ ...current, [v]: true }));
            }
        });
        powersRef.current = powers;

        idTimeout.current = setTimeout(
            () =>
                setPowersFlash({
                    shrinkPower: false,
                    slowPower: false,
                    superShotPower: false,
                }),
            3000
        );

        return () => {
            clearTimeout(idTimeout.current || 0);
        };
    }, [powers]);
    return (
        <div
            className={`power-ups ${isDarkMode ? "power-ups--dark" : ""} ${
                isMobile ? "power-ups--mobile" : ""
            }`}
            style={{ height }}
        >
            <div
                className={`power-ups__power-up ${
                    powers.shrinkPower.ativo ? "ativo" : ""
                } ${
                    !powers.shrinkPower.ativo && powers.shrinkPower.carga < 1
                        ? "cooldown"
                        : ""
                } ${
                    powersFlash.shrinkPower || powers.shrinkPower.ativo
                        ? "power-flash"
                        : ""
                }`}
                style={
                    powers.shrinkPower.ativo
                        ? {
                              animationDuration: `${powers.shrinkPower.tempoAnimacao}ms`,
                          }
                        : {}
                }
                onClick={(e) => {
                    const fakeEvent = new KeyboardEvent("keydown", {
                        key: "q",
                        code: "KeyQ",
                    });

                    window.dispatchEvent(fakeEvent);
                    e.stopPropagation();
                }}
            >
                <ShrinkIcon />

                <p>Q</p>
                <div className="quantidade">{powers.shrinkPower.carga}</div>
            </div>

            <div
                className={`power-ups__power-up ${
                    powers.slowPower.ativo ? "ativo" : ""
                } ${
                    !powers.slowPower.ativo && powers.slowPower.carga < 1
                        ? "cooldown"
                        : ""
                } ${
                    powersFlash.slowPower || powers.slowPower.ativo
                        ? "power-flash"
                        : ""
                }`}
                style={
                    powers.slowPower.ativo
                        ? {
                              animationDuration: `${powers.slowPower.tempoAnimacao}ms`,
                          }
                        : {}
                }
                onClick={(e) => {
                    const fakeEvent = new KeyboardEvent("keydown", {
                        key: "w",
                        code: "KeyW",
                    });

                    window.dispatchEvent(fakeEvent);
                    e.stopPropagation();
                }}
            >
                <SlowIcon />
                <p>W</p>

                <div className="quantidade">{powers.slowPower.carga}</div>
            </div>

            <div
                className={`power-ups__power-up ${
                    powers.superShotPower.status === "apontar" ? "ativo" : ""
                } ${
                    powers.superShotPower.status !== "apontar" &&
                    powers.superShotPower.carga < 1
                        ? "cooldown"
                        : ""
                } ${
                    powersFlash.superShotPower ||
                    powers.superShotPower.status === "apontar"
                        ? "power-flash"
                        : ""
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    const fakeEvent = new KeyboardEvent("keydown", {
                        key: "e",
                        code: "KeyE",
                    });

                    window.dispatchEvent(fakeEvent);
                }}
            >
                <SuperShotIcon />
                <p>E</p>

                <div className="quantidade">{powers.superShotPower.carga}</div>
            </div>
        </div>
    );
}

export default PowerUps;
