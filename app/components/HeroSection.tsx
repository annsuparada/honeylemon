'use client'
import React from 'react'
import FormattedDate from './FormattedDate'

type HeroSectionProps = {
    isHomepage?: boolean
    title: string
    description?: string
    imageUrl: string
    ctaText?: string
    onCtaClick?: () => void
    isSingleBlogPage?: boolean
    category?: string
    author?: string
    date?: string | number | Date;
}

const HeroSection = ({
    isHomepage = false,
    title,
    description,
    imageUrl,
    ctaText = 'Get Started',
    onCtaClick,
    isSingleBlogPage = false,
    category,
    author,
    date
}: HeroSectionProps) => {
    return (
        <div
            className={`relative hero ${isHomepage ? 'min-h-screen' : 'min-h-[50vh]'}`}
            style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0"></div>

            {/* Content */}
            {isSingleBlogPage ? (
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32 sm:pb-20">
                    <div className="max-w-screen-md">
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white text-shadow-lg/30 leading-tight">
                            {title}
                        </h1>

                        <p className="mt-4 text-sm sm:text-base lg:text-lg text-white text-shadow-lg/30">
                            {description}
                        </p>
                        <p className="mt-4 text-sm sm:text-base lg:text-lg text-white text-shadow-lg/30">
                            {author} | {date && <FormattedDate dateString={date} />}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 hero-content text-neutral-content w-full justify-start px-8">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center w-full">
                        <div className="w-full lg:max-w-xl">
                            <h1 className={`mb-5 text-3xl lg:text-5xl font-bold text-white text-shadow-lg/30 ${!isHomepage && 'mt-12'}`}>
                                {title}
                            </h1>
                            <p className="mb-5 text-white text-shadow-lg/30">{description}</p>
                            {onCtaClick && (
                                <button className="btn btn-accent rounded-sm" onClick={onCtaClick}>
                                    {ctaText}
                                </button>
                            )}
                        </div>
                        <div className="w-full lg:max-w-xl"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HeroSection
