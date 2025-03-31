'use client'
import React from 'react'

type HeroSectionProps = {
    isHomepage?: boolean
    title: string
    description: string
    imageUrl: string
    ctaText?: string
    onCtaClick?: () => void
}

const HeroSection = ({
    isHomepage = false,
    title,
    description,
    imageUrl,
    ctaText = 'Get Started',
    onCtaClick,
}: HeroSectionProps) => {
    return (
        <div
            className={`hero ${isHomepage ? 'min-h-screen' : 'min-h-[50vh]'}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content text-neutral-content w-full justify-start px-8">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-center w-full">
                    {/* Left Block */}
                    <div className="w-full lg:max-w-xl">
                        <h1 className={`mb-5 text-3xl lg:text-5xl font-bold ${!isHomepage && 'mt-12'}`}>{title}</h1>
                        <p className="mb-5">{description}</p>
                        {onCtaClick && (
                            <button className="btn btn-primary rounded-sm" onClick={onCtaClick}>
                                {ctaText}
                            </button>
                        )}
                    </div>

                    {/* Right Block (optional content can go here) */}
                    <div className="w-full lg:max-w-xl"></div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection
