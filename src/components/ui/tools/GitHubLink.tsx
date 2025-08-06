import { useState } from "react";
import "./git-hub-link.scss";
function GitHubLink() {
    const [show, setShow] = useState(false);
    const LINK = "https://github.com/edsoncarvalhointuria/react-arcade-hub.git";
    return (
        <div
            className={`github-link ${show ? "github-link--show" : ""}`}
            onMouseOver={() => setShow(true)}
            onMouseOut={() => setShow(false)}
            onTouchStart={() => {
                if (show === true) window.open(LINK, "_blank");
                setShow((v) => !v);
            }}
        >
            <a href={LINK} className="github-link--link" target="_blank">
                <img
                    src="./wired-lineal-2572-logo-github-hover-pinch.gif"
                    alt="Icone GITHUB"
                />
            </a>
            <div className="github-link--seta"></div>
            <div className="github-link--invisible-click"></div>
        </div>
    );
}

export default GitHubLink;
