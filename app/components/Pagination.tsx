import Link from "next/link"

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, basePath }) => {
    const createPageLink = (page: number) => `${basePath}?page=${page}`

    return (
        <div className="flex justify-center items-center space-x-4 mt-8">
            <Link
                href={createPageLink(Math.max(currentPage - 1, 1))}
                className={`btn btn-outline btn-sm btn-secondary rounded-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
                Previous
            </Link>

            <span className="text-sm">
                Page {currentPage} of {totalPages}
            </span>

            <Link
                href={createPageLink(Math.min(currentPage + 1, totalPages))}
                className={`btn btn-outline btn-sm btn-secondary rounded-sm ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
                Next
            </Link>
        </div>
    )
}

export default Pagination
