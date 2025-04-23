import { title } from "process";
import SectionHeader from "./SectionHeader";

export type FeatureItem = {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    highlightColor?: string;
};

export type BentoFeatureCardProps = {
    item: FeatureItem;
    className?: string;
    roundedClass?: string;
};

const BentoFeatureCard = ({ item, className = "", roundedClass = "" }: BentoFeatureCardProps) => {
    return (
        <div className={`relative ${className}`}>
            <div className={`absolute inset-px rounded-lg bg-base-100 shadow ${roundedClass}`} />
            <div className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] ${roundedClass}`}>
                <img
                    alt={item.title}
                    src={item.imageUrl}
                    className="h-80 object-cover object-center"
                />
                <div className="p-10 pt-4">
                    <h3 className="text-sm/4 font-semibold text-primary">
                        {item.title}
                    </h3>
                    <p className="mt-2 text-lg font-medium tracking-tight text-secondary">{item.subtitle}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-neutral-content">{item.description}</p>
                </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 ${roundedClass}`} />
        </div>
    );
};

type BentoFeaturesProps = {
    sectionTitle: string;
    sectionSubTitle: string;
    features: FeatureItem[];
};

export default function BentoFeatures({ features, sectionTitle, sectionSubTitle }: BentoFeaturesProps) {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <SectionHeader title={sectionTitle} subtitle={sectionSubTitle} />
                <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
                    {features.map((item, index) => {
                        const gridClass =
                            index === 0
                                ? "lg:col-span-3 lg:rounded-tl-[2rem]"
                                : index === 1
                                    ? "lg:col-span-3 lg:rounded-tr-[2rem]"
                                    : index === 2
                                        ? "lg:col-span-2 lg:rounded-bl-[2rem]"
                                        : index === 4
                                            ? "lg:col-span-2 lg:rounded-br-[2rem]"
                                            : "lg:col-span-2";

                        return (
                            <BentoFeatureCard
                                key={index}
                                item={item}
                                className={gridClass}
                                roundedClass={gridClass.replace("lg:", "")}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
