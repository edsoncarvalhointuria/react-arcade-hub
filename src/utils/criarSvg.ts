import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

export function criarSVG(svgComponent: ReactElement) {
    const svgString = renderToString(svgComponent);
    return new Promise((resolve) => {
        const img = new Image();

        img.src = `data:image/svg+xml;base64,${window.btoa(svgString)}`;
        img.onload = () => {
            resolve(img);
        };
    });
}
