interface ReadTimeProps {
    readTime?: number | null;
    className?: string;
}

/**
 * ReadTime component that displays the estimated reading time
 */
export default function ReadTime({ readTime, className = "text-sm text-gray-600" }: ReadTimeProps) {
    if (readTime === undefined || readTime === null) {
        return null;
    }

    return (
        <div className={className}>
            📖 {readTime} min read
        </div>
    );
}

