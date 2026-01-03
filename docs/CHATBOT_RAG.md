# AI Chatbot RAG Integration Plan

**Status:** Draft
**Author:** Ahmed Adel Bakr Alderai
**Date:** 2026-01-03

## Overview

The current "Ahmed AI" chatbot relies on a hardcoded system prompt injected with structured data from `resume.ts` and `projects.ts`. While effective for high-level summaries, it lacks visibility into the detailed content of the blog posts and specific contribution details.

This document outlines the plan to implement Retrieval-Augmented Generation (RAG) to allow the chatbot to answer questions based on the full content of the portfolio, including MDX blog posts.

## Current Architecture

-   **Frontend:** `src/components/features/AIChatbot.tsx` (React)
-   **Backend:** `src/pages/api/chat.ts` (Astro API Route)
-   **Context:** `src/lib/chatContext.ts` (Static imports of Resume/Projects)
-   **LLM:** Anthropic Claude 3 Haiku (via API Key) or Mock Mode

## Objectives

1.  **Expand Knowledge Base:** Enable the chatbot to query blog posts (`src/content/blog/*.mdx`) and contribution details (`src/content/contributions/*.json`).
2.  **Scalability:** Move away from injecting *all* context into the system prompt, which helps manage token costs and limits as content grows.
3.  **Accuracy:** Retrieve specific excerpts to reduce hallucinations.

## Implementation Plan

### Phase 1: Data Ingestion & Embedding

Since this is a personal portfolio with a relatively small dataset ( < 100 documents), we can use a lightweight, server-side embedding approach without a heavy external vector DB infrastructure.

1.  **Content Extraction:**
    *   Create a utility to parse MDX files from `src/content/blog` and JSON from `src/content/contributions`.
    *   Strip MDX/HTML tags to get raw text.
    *   Chunk text into manageable segments (e.g., paragraphs or 500-character chunks).

2.  **Embeddings:**
    *   Use a lightweight embedding model.
    *   *Option A (External):* OpenAI `text-embedding-3-small` or Vertex AI embeddings (if already using GCP).
    *   *Option B (Local/Serverless):* A small Transformers.js model or similar if runtime allows, but API is likely simpler for Vercel deployment.
    *   *Decision:* **Use OpenAI Embeddings or Vertex AI** for reliability and simplicity in the Vercel serverless function environment.

3.  **Vector Store:**
    *   For this scale, an in-memory vector store or a simple JSON file generated at build time is sufficient.
    *   **Proposal:** Generate `public/embeddings.json` during the build process (or a server-side initialized memory cache). Given Vercel serverless nature, a JSON file loaded into memory or a lightweight database like **Upstash Vector** (Redis) or **Supabase pgvector** would be robust.
    *   *MVP Selection:* **In-memory Vector Store** initialized on first request (with caching) or **Upstash Vector** (Free tier is generous). Let's aim for a **Build-time generated JSON index** loaded by the API route for simplicity and zero external infra dependency if possible.

### Phase 2: Retrieval Logic (`src/pages/api/chat.ts`)

1.  **Modify API Route:**
    *   Receive user message.
    *   Generate embedding for the user query.
    *   Perform cosine similarity search against the pre-loaded index.
    *   Select Top-K (e.g., Top 3) relevant chunks.

2.  **Context Construction:**
    *   Dynamically build the System Prompt.
    *   *Base:* Core Persona & Critical Resume Data (Keep this static as it's small).
    *   *Dynamic:* "Here is some relevant context from Ahmed's writings:" + [Retrieved Chunks].

### Phase 3: Integration

1.  **Dependencies:**
    *   `langchain` (optional, might be overkill, raw code is lighter).
    *   `cheerio` or `remark` for text stripping.
    *   Cosine similarity function.

2.  **Workflow:**
    *   User sends: "What did you write about LLM security?"
    *   Backend: Embeds query -> Searches `embeddings.json` -> Finds `securing-llm-applications.mdx` chunks.
    *   Prompt: "User asks about LLM security. Use this context: [Chunk 1]..."
    *   LLM Responds: "Ahmed wrote about..."

## Roadmap

1.  [ ] **Step 1:** Create `scripts/generate-embeddings.ts`.
    *   Read `src/content`.
    *   Clean text.
    *   Generate embeddings (using a placeholder or mock for dev).
    *   Save to `src/data/vector-index.json`.
2.  [ ] **Step 2:** Update `src/pages/api/chat.ts`.
    *   Load `vector-index.json`.
    *   Implement cosine similarity.
    *   Inject relevant chunks into `messages`.
3.  [ ] **Step 3:** Test with real queries.

## Signed
Ahmed Adel Bakr Alderai
