import React from "react";

interface CTAProps {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonUrl: string;
    gradientBg?: string;
}

const CTA: React.FC<CTAProps> = ({
    title,
    subtitle,
    buttonText,
    buttonUrl,
    gradientBg = "from-blue-600 via-sky-500 to-cyan-400",
}) => {
    return (
        <div className={`bg-gradient-to-r ${gradientBg} py-24 sm:py-32`}>
            <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
                <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    {title}
                    <br />
                    <span className="text-2xl font-normal">{subtitle}</span>
                </h2>
                <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
                    <a
                        href={buttonUrl}
                        className="rounded-lg bg-white px-6 py-3 text-base font-bold text-indigo-700 shadow-lg transition-all duration-300 hover:bg-yellow-300 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        {buttonText}
                        <span className="ml-2 inline-block transform transition-transform hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CTA;
