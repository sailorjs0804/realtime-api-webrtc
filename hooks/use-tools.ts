"use client"

import {useTranslations} from "@/components/translations-context"

export const useToolsFunctions = () => {
    const {t} = useTranslations();

    const searchKnowledgeBaseFunction = async ({query}: { query: string }) => {
        // 从 localStorage 获取 kb_id，如果没有则使用默认值
        const kb_id = localStorage.getItem('kb_id') || '';

        // 使用 Next.js API 路由，避免 CORS 问题
        const response = await fetch('/api/v1/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({query: query, kb_id: kb_id}),
        });

        if (!response.ok) {
            throw new Error(`Query failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    return {
        searchKnowledgeBaseFunction,
        // timeFunction,
        // backgroundFunction,
        // partyFunction,
        // launchWebsite,
        // copyToClipboard,
        // scrapeWebsite
    }
}