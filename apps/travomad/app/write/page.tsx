'use client';

import React, { useMemo } from 'react';
import { createPost, fetchPostBySlug, updatePost } from '@/utils/actions/postActions';
import { createCategory, fetchAllCategories } from '@/utils/actions/categoryAction';
import { createTag, fetchAllTags } from '@/utils/actions/tagAction';
import { WritePageClient } from '@honeylemon/ui';
import { extensions } from '../lib/tiptapExtensions';
import { handleSavePost } from '@/utils/handlers/savePostHandler';

const placeholderImg =
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const WritePage = () => {
    const actions = useMemo(
        () => ({
            fetchPostBySlug,
            fetchAllCategories,
            fetchAllTags,
            createCategory,
            createTag,
        }),
        []
    );

    return (
        <WritePageClient
            extensions={extensions}
            placeholderImage={placeholderImg}
            actions={actions}
            onSave={handleSavePost}
            createPost={createPost}
            updatePost={updatePost}
        />
    );
};

export default WritePage;
