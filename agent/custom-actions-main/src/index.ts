// src/index.ts
import {
    IAgentRuntime,
    Memory as ElizaMemory,
    elizaLogger
} from "@elizaos/core";
import { TwitterClient } from '@elizaos/twitter-client';
import { searchPubMed } from './utils/search';
import { formatTweet } from './utils/formatter';
import { PubmedError, PubmedErrorCodes } from './error';
import type { Action, PubmedArticle } from './types';

// Define constants
const SEARCH_TOPICS = [
    'Medical Research',
    'Clinical Trials',
    'Healthcare Innovation',
    'Public Health',
    'Disease Prevention',
    'Treatment Advances',
    'Medical Technology',
    'Drug Development',
    'Epidemiology',
    'Precision Medicine'
] as const;

const DEFAULT_MAX_RESULTS = 5;

// Define interfaces
interface MessageContent {
    text?: string;
    action?: string;
}

interface ExtendedMemory extends ElizaMemory {
    replyToId?: string;
    content: MessageContent;
}

interface TwitterRuntime extends IAgentRuntime {
    clients: {
        twitter: TwitterClient;
    };
}

// Handler for the SEARCH_PUBMED action
const searchHandler = async (runtime: TwitterRuntime, message: ExtendedMemory): Promise<boolean> => {
    try {
        const query = message.content?.text?.replace(/@\w+/g, '').trim();
        if (!query) {
            elizaLogger.warn('No search query provided');
            return false;
        }

        const results = await searchPubMed(query, {
            maxResults: DEFAULT_MAX_RESULTS,
            sortBy: 'relevance'
        }, runtime.config);

        if (results.articles.length === 0) {
            const noResultsMessage = `No research found for: "${query}". Try rephrasing your search.`;
            if (message.replyToId) {
                await runtime.clients.twitter.replyTo(message.replyToId, noResultsMessage);
            } else {
                await runtime.clients.twitter.createPost(noResultsMessage);
            }
            elizaLogger.info('No articles found for query:', { query });
            return true;
        }

        const article = results.articles[0];
        const tweetText = formatTweet(article);

        if (message.replyToId) {
            await runtime.clients.twitter.replyTo(message.replyToId, tweetText);
        } else {
            await runtime.clients.twitter.createPost(tweetText);
        }

        elizaLogger.info('Posted research:', {
            articleId: article.pmid,
            query
        });
        return true;
    } catch (error) {
        elizaLogger.error('Failed to search and reply:', error);
        throw new PubmedError(
            PubmedErrorCodes.API_ERROR,
            'Failed to search and reply',
            error
        );
    }
};

// Handler for the POST_RESEARCH action
const postHandler = async (runtime: TwitterRuntime, message: ElizaMemory): Promise<boolean> => {
    try {
        const randomTopic = SEARCH_TOPICS[Math.floor(Math.random() * SEARCH_TOPICS.length)];
        const results = await searchPubMed(randomTopic, {
            maxResults: DEFAULT_MAX_RESULTS,
            sortBy: 'date'
        }, runtime.config);

        if (results.articles.length === 0) {
            elizaLogger.info('No articles found for topic:', { topic: randomTopic });
            return false;
        }

        const article = results.articles[0];
        const tweetText = formatTweet(article);
        await runtime.clients.twitter.createPost(tweetText);

        elizaLogger.info('Posted research:', {
            articleId: article.pmid,
            topic: randomTopic
        });
        return true;
    } catch (error) {
        elizaLogger.error('Failed to post research:', error);
        throw new PubmedError(
            PubmedErrorCodes.API_ERROR,
            'Failed to post research',
            error
        );
    }
};

// Define and export the SEARCH_PUBMED action
export const SEARCH_PUBMED = {
    name: "SEARCH_PUBMED",
    similes: ["FIND_RESEARCH", "RESEARCH_SEARCH"],
    description: "Searches PubMed for medical research based on user query and posts results",
    validate: async (runtime: IAgentRuntime, message: ExtendedMemory): Promise<boolean> => {
        const text = message.content?.text || '';
        return text.toLowerCase().includes('research') ||
               text.toLowerCase().includes('search');
    },
    handler: searchHandler,
    examples: [
        [
            {
                user: "user1",
                content: { text: "Search for research about diabetes" }
            },
            {
                user: "pubmed_bot",
                content: {
                    text: "I'll search PubMed for diabetes research",
                    action: "SEARCH_PUBMED"
                }
            }
        ]
    ]
} as Action;

// Define and export the POST_RESEARCH action
export const POST_RESEARCH = {
    name: "POST_RESEARCH",
    similes: ["SHARE_RESEARCH", "TWEET_RESEARCH"],
    description: "Posts recent medical research from PubMed on a random topic",
    validate: async (runtime: IAgentRuntime, message: ElizaMemory): Promise<boolean> => {
        return true; // Always true for scheduled posts
    },
    handler: postHandler,
    examples: [
        [
            {
                user: "system",
                content: { text: "Scheduled research post" }
            },
            {
                user: "pubmed_bot",
                content: {
                    text: "Here's the latest medical research update!",
                    action: "POST_RESEARCH"
                }
            }
        ]
    ]
} as Action;

