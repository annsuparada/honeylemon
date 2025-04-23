'use client';

import React, { useEffect, useState } from 'react';

interface PaginationClientProps<T> {
    items: T[];
    itemsPerPage: number;
    onPageChange: (currentItems: T[]) => void;
}

const PaginationClient = <T,>({
    items,
    itemsPerPage,
    onPageChange,
}: PaginationClientProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        onPageChange(items.slice(start, end));
    }, [currentPage, items, itemsPerPage, onPageChange]);

    return (
        <div className="flex justify-center items-center space-x-4 mt-8">
            <button
                className={`btn btn-outline btn-sm btn-secondary rounded-sm ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
                Previous
            </button>

            <span className="text-sm">
                Page {currentPage} of {totalPages}
            </span>

            <button
                className={`btn btn-outline btn-sm btn-secondary rounded-sm ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
                Next
            </button>
        </div>
    );
};

export default PaginationClient;
