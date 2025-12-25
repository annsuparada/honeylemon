'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaEdit } from 'react-icons/fa';

interface EditPostButtonProps {
    authorId: string;
    slug: string;
}

export default function EditPostButton({ authorId, slug }: EditPostButtonProps) {
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        // Check if user is logged in and is the author
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.id === authorId) {
                    setCanEdit(true);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [authorId]);

    if (!canEdit) {
        return null;
    }

    return (
        <Link
            href={`/write?slug=${slug}`}
            className="btn btn-outline btn-accent btn-sm rounded flex items-center gap-2"
        >
            <FaEdit /> Edit Post
        </Link>
    );
}

