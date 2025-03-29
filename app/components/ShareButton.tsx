"use client"; // Ensure it runs only in the browser

import { useState } from "react";
import { MdOutlineIosShare } from "react-icons/md";
import { FaFacebook, FaXTwitter, FaLinkedin, FaLink } from "react-icons/fa6";

const ShareButton = ({ title }: { title: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    // Share via Web Share API (Mobile)
    const handleNativeShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title,
                    text: `Check out this post: ${title}`,
                    url: currentUrl,
                })
                .then(() => console.log("Successfully shared"))
                .catch((error) => console.error("Error sharing", error));
        }
    };

    // Copy to Clipboard
    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        alert("Link copied to clipboard! 📋");
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Share Icon */}
            <MdOutlineIosShare
                onClick={() => setIsOpen(!isOpen)}
                className="text-2xl cursor-pointer text-gray-600 hover:text-blue-600 transition duration-200"
            />

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {/* Copy Link */}
                        <li className="px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100" onClick={handleCopyLink}>
                            <FaLink className="text-blue-500" /> <span>Copy Link</span>
                        </li>

                        {/* Facebook */}
                        <li className="px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 w-full">
                                <FaFacebook className="text-blue-600" /> <span>Facebook</span>
                            </a>
                        </li>

                        {/* Twitter (X) */}
                        <li className="px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100">
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 w-full">
                                <FaXTwitter className="text-black" /> <span>Twitter (X)</span>
                            </a>
                        </li>

                        {/* LinkedIn */}
                        <li className="px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-100">
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 w-full">
                                <FaLinkedin className="text-blue-700" /> <span>LinkedIn</span>
                            </a>
                        </li>
                    </ul>
                </div>
            )}

        </div>
    );
};

export default ShareButton;
