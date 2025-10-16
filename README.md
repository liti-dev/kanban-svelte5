# Kanban Board

A simple Kanban board built with Svelte 5, supporting multiple boards, columns, and cards with drag & drop, validation, and error handling.
Designed with an Autumn/Halloween 🎃 theme for seasonal fun. Time spent: 10hrs

https://www.loom.com/share/ddf9467c84684d64be9f5b3f8d9053af?sid=0617f808-8548-4506-be1d-eb753d131f17

## Running locally

```bash
# Clone repo
# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

## Features

- **Multi-board Management**: Switch between different projects/boards
- **CRUD for columns, cards**
- **Drag & Drop**: Swap columns, move cards between columns and reorder them within columns
- **Instant Updates**: Changes are immediately reflected in the UI
- **Persistent State**: All changes are saved to a JSON file on the server via secure remote functions

## Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript
- **Server Communication**: SvelteKit Remote Functions
- **Validation**: Valibot (server-side validation)
- **Drag & Drop**: svelte-dnd-action
- **ID Generation**: nanoid
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier

## Theme: Building secure apps more easily with remote functions and validation

This project demonstrates a modern approach to building secure, type-safe web apps using SvelteKit's remote functions. This pattern eliminates common security vulnerabilities while providing good developer experience.

![security diagram](/flow.png)

### 1. SvelteKit remote functions

- Functions (query, form, etc.) run on server, preventing client-side tampering
- Combined with Svelte’s await, it allows to load and manipulate data directly inside components
- No need to manually create and secure endpoints because SvelteKit generates them behind the scenes
- Built-in error handling: handle validation errors, network failures, and server errors

### 2. Valibot server-side schema validation

- Users can't disable JS and manipulate the validation
- Invalid data never reaches business logic

```typescript
export const cardSchema = object({
	boardId: string(),
	columnId: string(),
	content: pipe(
		string(),
		minLength(1, 'Card content is required'),
		minLength(3, 'Card content must be at least 3 characters')
	)
});

// Schema is enforced on the SERVER before the function runs
export const createCard = form(cardSchema, async (data) => {
	// data is guaranteed to be valid here - validation happened server-side
	// No need for manual validation checks
});
```

### 3. Client-side validation

- Preflight: validates on the client before sending to server. Even when client validation is bypassed, server still validates with same schema

```typescript
<form {...createBoard.preflight(boardSchema)}>
    <!-- Display validation errors for the title field -->
    {#each createBoard.fields.title.issues() as issue}
        <p class="error-message">{issue.message}</p>
    {/each}

    // Form input with validation attributes
    <input {...createBoard.fields.title.as('text')} placeholder="New board title" required />
```

**Other validation methods**

- **Business logic**: Custom server-side validation using `invalid()` function

### Areas for Improvement

- Lacks unit and integration tests
- CSS or design can be cleaner
- While functional, could improve accessibility (better keyboard navigation)
- Replace json file with real db (supabase)

### Development Process

#### Planning

I started by thinking carefully about data structure, whether to use nested structures (boards → columns → cards) or flat structures. For a simple Kanban, nested felt right, but I noted that scaling would likely require flattening for performance.
This project was my first deep dive into Remote Functions, Async, Valibot and svelte-dnd-action

#### AI-Assisted workflow

**Tools Used:**

- **ChatGPT-4**: For tech stack discussions and problem-solving
- **VSCode Claude 3.5**: For code implementation and debugging
- **Svelte MCP + llm.txt**: Fed VSCode with Svelte documentation

**Strategy: Pair-programming**
If seniors developer treat AI as a junior, then I (as a junior) treat AI like my coding buddy. However, I still use my teddy bear as another coding buddy for sanity check.

- **No bulk code generation**: I avoided relying heavily on AI or letting AI write large chunks of code at once because it's nearly impossible to understand code and debug
- **Incremental development**: I wrote code first to familiarise myself with syntax and logics, then asked AI to correct my code and apply similar patterns elsewhere
- **Reasoning validation**: I constantly asked random questions to test AI understanding and cross-referenced with official docs. Also, human oversight is crucial for business logics/ system design decisions. Due to Svelte's recent changes, supervision is needed to make sure AI adheres to good practice (like avoid `$effect` unless needed, using `$derived` instead) and new syntax (Svelte 5 runes instead of Svelte 3/4. They keep applying old approach)

#### The Drag & Drop challenge

The drag-and-drop feature turned out to take the most of my time. The most frustrating bug was an `undefined parentElementID` error that would randomly crash the drag-and-drop functionality.

After consulting online tutorials, the issue was possibly related to missing `key` attributes in `{#each}` blocks so I added `card.id`. I didn't have enough time to read all svelte-dnd docs so I just made sure `dndzone` had all required options.

This experience taught me that seemingly simple app can hide significant complexity.
