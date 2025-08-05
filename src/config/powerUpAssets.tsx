import type { JSX } from "react";
import type {
    PowersBreakoutNamesType,
    PowersInvadersNamesType,
} from "../types/Powers";
import BarrierIcon from "../components/ui/Icons/BarrierIcon";
import ExplosionIcon from "../components/ui/Icons/ExplosionIcon";
import MultiBallIcon from "../components/ui/Icons/MultiBallIcon";
import ExpandIcon from "../components/ui/Icons/ExpandIcon";
import SuperShotIcon from "../components/ui/Icons/SuperShotIcon";
import HeartIcon from "../components/ui/Icons/HeartIcon";
import RicochetearIcon from "../components/ui/Icons/RicochetearIcon";
import ShieldIcon from "../components/ui/Icons/ShieldIcon";

const POWER_UP_CONFIG = {
    barreira: BarrierIcon,
    explosao: ExplosionIcon,
    multiball: MultiBallIcon,
    raquete_gigante: ExpandIcon,
    super_shot: SuperShotIcon,
    mais_vida: HeartIcon,
    multi_shot: MultiBallIcon,
    explosive_shot: ExplosionIcon,
    ricochetear: RicochetearIcon,
    shield: ShieldIcon,
};

export const powersIconsComponents: Partial<
    Record<PowersBreakoutNamesType | PowersInvadersNamesType, JSX.Element>
> = {};
for (const key in POWER_UP_CONFIG) {
    const Component = POWER_UP_CONFIG[key as PowersBreakoutNamesType];
    if (Component)
        powersIconsComponents[key as PowersBreakoutNamesType] = <Component />;
}
