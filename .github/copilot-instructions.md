---
applyTo: '**'
---


# Copilot Coding Style & Project Instructions

## General Coding Style
- Use consistent formatting as per the existing codebase (indentation, semicolons, quotes, etc.).
- Prefer functional components and hooks for React/Next.js code.
- Use TypeScript types and interfaces for all function parameters, props, and return values.
- Use named exports unless a default export is clearly more appropriate.
- Keep files and components small and focused on a single responsibility.
- Use absolute imports (e.g., `src/components/...`) if the project is configured for it, otherwise use relative imports.
- Write clear, concise, and descriptive comments where necessary, but avoid redundant comments.
- Use async/await for asynchronous code, avoid .then/.catch chaining.
- Use destructuring for props and object parameters where it improves readability.

## React & Next.js Specific
- **Do not import React** at the top of component files; Next.js does not require it.
- Import hooks and functions directly from `react` (e.g., `import { useState } from 'react'`), **do not** use `React.useState` or similar patterns.
- Use Next.js conventions for file and folder structure (e.g., `app/`, `components/`, `lib/`).
- Use Next.js routing and API conventions for new pages and endpoints.
- Use server and client components appropriately as per Next.js 13+ standards.

## Database & SQL Migrations
- If any SQL migration or schema change is made by the coding agent, always create or update table definitions in a markdown file at `db/structure.md`.
	- The file should contain a clear, up-to-date schema for each table, listing all columns and their types.
	- This helps the coding agent and developers keep track of the current database structure.

## Other Guidelines
- Use Tailwind CSS utility classes for styling unless otherwise specified.
- Use environment variables for secrets and configuration, never hardcode them.
- Write code that is accessible and follows best practices for usability.

## Reviewing & Answering
- When reviewing or answering, reference these guidelines and point out any inconsistencies.
- If unsure about a style, prefer the most common pattern already present in the codebase.