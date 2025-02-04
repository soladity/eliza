# PubMed Custom Action for Eliza

This custom action enables Eliza to search and share PubMed research articles through Twitter.

## Features

- Scheduled posting of research articles on specific topics
- Responds to mentions and direct messages with relevant research
- Handles empty search results gracefully
- Proper error handling and logging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Dependencies

This custom action requires the following peer dependencies:
- @elizaos/core
- @elizaos/twitter-client

These should be provided by the Eliza runtime environment.

## Configuration

The action uses the following configuration:
- Default search topics: AI, Machine Learning, Neural Networks
- Default max results: 5 articles per search
- Scheduled posting: Every 30 minutes

## Error Handling

The action implements proper error handling with custom error types:
- API errors
- Rate limiting
- Network issues
- Invalid search parameters

## Development

1. Run type checking:
```bash
npm run type-check
```

2. Run linting:
```bash
npm run lint
```

3. Run tests:
```bash
npm test
```

## Type Declarations

This package includes TypeScript declarations for @elizaos packages in `src/types`. These are used for development and type checking, while the actual implementations are provided by the Eliza runtime environment.