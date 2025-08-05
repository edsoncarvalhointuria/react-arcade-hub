import type { RefObject } from "react";
import "./button-click.scss";
function ButtonClick({
    type = "space",
    moveInvaders,
}: {
    type: "space" | "left" | "right";
    moveInvaders?: RefObject<{ left: boolean; right: boolean }>;
}) {
    return (
        <button
            className={`button-click button-click--${type}`}
            onClick={(evt) => {
                evt.stopPropagation();
                if (type === "space") {
                    const fakeEvent = new KeyboardEvent("keydown", {
                        key: " ",
                        code: "Space",
                    });
                    window.dispatchEvent(fakeEvent);
                }
            }}
            onTouchStart={(evt) => {
                if (type === "left") {
                    evt.preventDefault();
                    moveInvaders!.current.left = true;
                } else if (type === "right") {
                    evt.preventDefault();
                    moveInvaders!.current.right = true;
                }
            }}
            onTouchEnd={(evt) => {
                if (type === "left") {
                    evt.preventDefault();
                    moveInvaders!.current.left = false;
                } else if (type === "right") {
                    evt.preventDefault();
                    moveInvaders!.current.right = false;
                }
            }}
        >
            {type === "space" ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 48 48"
                    version="1.1"
                >
                    <title>click</title>
                    <g
                        id="click"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                        strokeLinecap="round"
                    >
                        <rect
                            width="48"
                            height="48"
                            fill="white"
                            fill-opacity="0.01"
                        />
                        <g
                            id="编组"
                            transform="translate(8.000000, 5.000000)"
                            stroke="#000000"
                            strokeWidth="4"
                        >
                            <g
                                id="分组"
                                transform="translate(7.000000, 7.000000)"
                                strokeLinejoin="round"
                            >
                                <path
                                    d="M0,14 L0,3 C0,1.34314575 1.34314575,0 3,0 C4.65685425,0 6,1.34314575 6,3 L6,14"
                                    id="Rectangle-2"
                                ></path>
                                <path
                                    d="M24,13 L24,19.5 C24,25.8512746 18.8512746,31 12.5,31 L11.5,31 C5.14872538,31 0,25.8512746 0,19.5 L0,13"
                                    id="Rectangle-4"
                                ></path>
                                <path
                                    d="M6,17 L6,15.1057529 L6,12 C6,10.3431458 7.34314575,9 9,9 C10.6568542,9 12,10.3431458 12,12 L12,15.1818037 L12,17"
                                    id="Rectangle-3"
                                ></path>
                                <path
                                    d="M12,17 L12,15.1057529 L12,12 C12,10.3431458 13.3431458,9 15,9 C16.6568542,9 18,10.3431458 18,12 L18,15.1818037 L18,17"
                                    id="Rectangle-3-Copy"
                                ></path>
                                <path
                                    d="M18,17 L18,15.1057529 L18,12 C18,10.3431458 19.3431458,9 21,9 C22.6568542,9 24,10.3431458 24,12 L24,15.1818037 L24,17"
                                    id="Rectangle-3-Copy-2"
                                ></path>
                            </g>
                            <path
                                d="M20,10 C20,8.94888684 19.8378284,7.93565088 19.5371411,6.98394793 C19.2008409,5.91952713 18.6912709,4.93207821 18.0415268,4.05469702 C16.2197921,1.59471942 13.2961294,0 10,0 C6.70387063,0 3.78020794,1.59471942 1.95847316,4.05469702 C1.30872911,4.93207821 0.799159071,5.91952713 0.462858909,6.98394793 C0.162171574,7.93565088 0,8.94888684 0,10"
                                id="路径"
                            ></path>
                        </g>
                    </g>
                </svg>
            ) : type === "left" ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"
                        fill="#000000"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.29289 4.29289C8.68342 3.90237 9.31658 3.90237 9.70711 4.29289L16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L9.70711 19.7071C9.31658 20.0976 8.68342 20.0976 8.29289 19.7071C7.90237 19.3166 7.90237 18.6834 8.29289 18.2929L14.5858 12L8.29289 5.70711C7.90237 5.31658 7.90237 4.68342 8.29289 4.29289Z"
                        fill="#000000"
                    />
                </svg>
            )}
        </button>
    );
}

export default ButtonClick;
