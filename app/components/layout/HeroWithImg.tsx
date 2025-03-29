import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface HeroWithImgProps {
  imgUrl: string
  heroText?: string
  subHeroText?: string
  description?: string
  showButton?: boolean
  buttonLink?: string
  buttonLabel?: string
  imageFrist?: boolean
}

const HeroWithImg: React.FC<HeroWithImgProps> = ({
  imgUrl,
  heroText,
  subHeroText,
  description,
  showButton = false,
  buttonLink = '/contact',
  buttonLabel = 'Get Started',
  imageFrist = false,
}) => {
  const showImgFirst = 'hero-content flex-col md:flex-row-reverse'
  const showImgSecond = 'hero-content flex-col md:flex-row'
  return (
    <div className="hero min-h-screen">
      <div className={!imageFrist ? showImgFirst : showImgSecond}>
        <Image
          src={imgUrl}
          alt="Hero"
          className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-sm shadow-2xl object-cover"
          width={200}
          height={200}
        />
        <div className="max-w-screen-sm p-1">
          <h1 className="text-5xl font-bold">{heroText}</h1>
          <h3>{subHeroText}</h3>
          <p className="py-6">{description}</p>
          {showButton && (
            <Link href={buttonLink} className="btn btn-primary">
              {buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeroWithImg
