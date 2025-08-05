import type {
    PowersBreakoutActiveType,
    PowersBreakoutNamesType,
    PowersInvadersActiveType,
    PowersInvadersNamesType,
} from "../../../types/Powers";

import "./powers-active.scss";
import { powersIconsComponents } from "../../../config/powerUpAssets";

function PowersActiveComponent({
    powersActive,
    positionLeft,
    shieldInvaders,
}: {
    powersActive: PowersBreakoutActiveType | PowersInvadersActiveType;
    positionLeft: number;
    shieldInvaders?: number;
}) {
    return (
        <div
            className="game-powers-active"
            style={{
                left: positionLeft,
            }}
        >
            {(
                Object.entries(powersActive) as [
                    PowersBreakoutNamesType | PowersInvadersNamesType,
                    boolean
                ][]
            )
                .filter(([_, isActive]) => isActive)
                .map(([nome], i) => {
                    return (
                        <div key={`${nome} - ${i}`}>
                            <span>{powersIconsComponents[nome]}</span>
                            {nome === "explosao" ? (
                                <>
                                    <p>Precione</p>
                                    <p>Espaço</p>
                                </>
                            ) : nome === "shield" ? (
                                <div className="game-powers-active--shield">
                                    {Array.from({
                                        length: shieldInvaders || 0,
                                    }).map((_, i) => (
                                        <div key={"shield" + i}></div>
                                    ))}
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    );
                })}
        </div>
    );
}

export default PowersActiveComponent;
