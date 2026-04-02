import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

const PaginationSSR: React.FC<PaginationProps> = ({ currentPage, totalPages, basePath }) => {
    const createPageLink = (page: number) => `${basePath}?page=${page}`;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div className="flex justify-center items-center space-x-4 mt-8">
            {isFirstPage ? (
                <span
                    className="btn btn-outline btn-sm btn-secondary rounded-sm opacity-50 cursor-not-allowed"
                    aria-disabled="true"
                >
                    Previous
                </span>
            ) : (
                <Link
                    href={createPageLink(currentPage - 1)}
                    className="btn btn-outline btn-sm btn-secondary rounded-sm"
                >
                    Previous
                </Link>
            )}

            <span className="text-sm">
                Page {currentPage} of {totalPages}
            </span>

            {isLastPage ? (
                <span
                    className="btn btn-outline btn-sm btn-secondary rounded-sm opacity-50 cursor-not-allowed"
                    aria-disabled="true"
                >
                    Next
                </span>
            ) : (
                <Link
                    href={createPageLink(currentPage + 1)}
                    className="btn btn-outline btn-sm btn-secondary rounded-sm"
                >
                    Next
                </Link>
            )}
        </div>
    );
};

export default PaginationSSR;

