import "./esc-icon.scss";

function EscIcon({ className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 40"
            className={`esc-icon ${className}`}
            fill="currentColor"
            onClick={(evt) => {
                evt.stopPropagation();
                const fakeEvent = new KeyboardEvent("keydown", {
                    key: "Escape",
                    code: "Escape",
                });
                window.dispatchEvent(fakeEvent);
            }}
        >
            <rect
                x="2"
                y="2"
                width="56"
                height="36"
                rx="6"
                ry="6"
                fill="#ffffff00"
                stroke="#fff"
                strokeWidth="2"
            />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize="16"
                fill="#fff"
            >
                ESC
            </text>
        </svg>
    );
}

export default EscIcon;
