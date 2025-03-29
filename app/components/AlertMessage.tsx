import React, { useEffect } from "react";

export interface AlertProps {
    message: { type: "success" | "error" | null; text: string | "" } | null;
    onClose: () => void;
    duration?: number; // Optional prop to set custom duration
}

const Alert: React.FC<AlertProps> = ({ message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose(); // Automatically close alert after duration
            }, duration);

            return () => clearTimeout(timer); // Cleanup timer on unmount
        }
    }, [message, onClose, duration]);

    if (!message) return null;

    return (
        <div
            role="alert"
            className={`alert ${message.type === "error" ? "alert-error" : "alert-success"} flex items-center justify-between p-4 rounded-md`}
        >
            <div className="flex items-center">
                <span className="ml-2">{message.text}</span>
            </div>
            {/* Close Button */}
            <button onClick={onClose} className="ml-4 text-black hover:text-gray-300">
                ✖
            </button>
        </div>
    );
};

export default Alert;
