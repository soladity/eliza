import { z } from 'zod';
import { IAgentRuntime, Memory } from "@elizaos/core";

// Define the Action interface based on Eliza's documentation
export interface Action {
    name: string;
    similes: string[];
    description: string;
    validate: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;
    handler: (runtime: IAgentRuntime, message: Memory, state?: any) => Promise<boolean>;
    examples: Array<Array<{
        user: string;
        content: { text: string; action?: string };
    }>>;
}

export interface PubmedArticle {
    pmid: string;
    title: string;
    abstract: string;
    authors: string[];
    journal: string;
    publicationDate: string;
    doi?: string;
    url?: string;
}

export interface PubmedSearchOptions {
    maxResults?: number;
    sortBy?: 'relevance' | 'date';
    fromDate?: string;
    toDate?: string;
}

export interface PubmedSearchResponse {
    articles: PubmedArticle[];
    total: number;
    query: string;
    timestamp: number;
}

export interface PubmedCache {
    articles: Record<string, PubmedArticle>;
    queries: Record<string, { ids: string[]; timestamp: number }>;
}

export interface RateLimiterOptions {
    maxRequests: number;
    perSeconds: number;
}

export interface ActionContext {
    input: Record<string, unknown>;
    config: Record<string, unknown>;
    twitterClient: {
        createPost: (text: string) => Promise<void>;
        replyTo: (id: string, text: string) => Promise<void>;
    };
}

// Re-export types with PubMed prefix for backward compatibility
export type PubMedArticle = PubmedArticle;
export type PubMedSearchOptions = PubmedSearchOptions;
export type PubMedSearchResponse = PubmedSearchResponse;
export type PubMedCache = PubmedCache;