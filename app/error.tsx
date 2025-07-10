"use client";
import { VscError } from "react-icons/vsc";

export default function Error() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
            <VscError size={48} />
            <h1 className="text-2xl font-semibold mt-6">Something went wrong!</h1>
            <p className="text-lg">Please try again later.</p>
        </div>

    );
}
