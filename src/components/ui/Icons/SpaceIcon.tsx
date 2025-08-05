import "./space-icon.scss";

function SpaceIcon({ className = "" }) {
    return (
        <svg
            className={`space-icon ${className}`}
            fill="currentColor"
            viewBox="0 0 320 60"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="spacebarGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                >
                    <stop offset="0%" style={{ stopColor: "#FEFEFE" }} />
                    <stop offset="100%" style={{ stopColor: "#FEFEFE" }} />
                </linearGradient>

                <mask id="cutout-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x="120" y="29" width="100" height="3" fill="black" />
                </mask>
            </defs>

            <rect
                x="1"
                y="1"
                width="318"
                height="58"
                rx="8"
                ry="8"
                fill="url(#spacebarGradient)"
                stroke="#BDBDBD"
                strokeWidth="1.5"
                mask="url(#cutout-mask)"
            />
        </svg>
    );
}

export default SpaceIcon;
