"use client";

import {
    FaFacebook,
    FaXTwitter,
    FaLinkedin,
    FaLink,
    FaPinterest,
} from "react-icons/fa6";
import { useState } from "react";

type ShareButtonProps = {
    title: string;
    url?: string;
};

const ShareButton = ({ title, url }: ShareButtonProps) => {
    const currentUrl = typeof window !== "undefined" ? url ?? window.location.href : "";
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sharePlatforms = [
        {
            name: "copy",
            icon: <FaLink className="text-blue-500" />,
            onClick: handleCopyLink,
        },
        {
            name: "facebook",
            icon: <FaFacebook className="text-blue-600" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        },
        {
            name: "twitter",
            icon: <FaXTwitter className="text-black" />,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
        },
        {
            name: "linkedin",
            icon: <FaLinkedin className="text-blue-700" />,
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`,
        },
        {
            name: "pinterest",
            icon: <FaPinterest className="text-red-600" />,
            href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&description=${encodeURIComponent(title)}`,
        },
    ];

    return (
        <div data-testid="share-button" className="flex space-x-2 items-center">
            {sharePlatforms.map((platform) =>
                platform.href ? (
                    <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-700 hover:scale-110 transition text-xl"
                    >
                        {platform.icon}
                    </a>
                ) : (
                    <button
                        key={platform.name}
                        onClick={platform.onClick}
                        className="flex items-center space-x-2 text-gray-700 hover:scale-110 transition"
                    >
                        {copied && platform.name === "copy" ? "✅" : platform.icon}
                    </button>
                )
            )}
        </div>
    );
};

export default ShareButton;

