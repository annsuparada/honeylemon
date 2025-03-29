'use client'
import React, { useState, useEffect } from 'react'

interface PaginationProps<T> {
    items: T[]
    itemsPerPage: number
    onPageChange: (currentItems: T[]) => void
}

const Pagination = <T,>({ items, itemsPerPage, onPageChange }: PaginationProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(items.length / itemsPerPage)

    useEffect(() => {
        const indexOfLastItem = currentPage * itemsPerPage
        const indexOfFirstItem = indexOfLastItem - itemsPerPage
        const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)
        onPageChange(currentItems)
    }, [currentPage, items, itemsPerPage, onPageChange])

    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button
                className="btn btn-outline btn-sm btn-secondary rounded-sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span>
                Page {currentPage} of {totalPages}
            </span>
            <button
                className="btn btn-outline btn-sm btn-secondary rounded-sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    )
}

export default Pagination
