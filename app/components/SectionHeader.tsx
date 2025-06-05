export type SectionHeaderProps = {
    title: string;
    subtitle: string;
};

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
    return (
        <div className="text-center mb-10">
            <h2 className="text-base/7 font-semibold text-primary text-xl">{title}</h2>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-pretty text-secondary sm:text-5xl">
                {subtitle}
            </p>
        </div>
    );
};

export default SectionHeader;
