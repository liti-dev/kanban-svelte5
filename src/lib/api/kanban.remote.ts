import { query, form, command } from '$app/server';
import { readDB, writeDB } from './db';
import { nanoid } from 'nanoid';
import { object, string } from 'valibot';
import {
	boardSchema,
	columnSchema,
	cardSchema,
	updateBoardSchema,
	updateColumnSchema,
	updateCardSchema,
	reorderCardsSchema,
	moveCardSchema
} from '../schemas/kanban';

// BOARDS
export const getBoards = query(async () => {
	const db = await readDB();
	return db.boards;
});

export const getBoardById = query(object({ id: string() }), async (params) => {
	const db = await readDB();
	return db.boards.find((b) => b.id === params.id) ?? null;
});

export const createBoard = form(boardSchema, async (data: { title: string }, invalid) => {
	const db = await readDB();

	// Check if title exists
	const existingBoard = db.boards.find((b) => b.title.toLowerCase() === data.title.toLowerCase());
	if (existingBoard) {
		invalid(invalid.title('A board with this title already exists'));
	}

	const newBoard = { id: nanoid(), title: data.title, columns: [] };
	db.boards.push(newBoard);
	await writeDB(db);
	await getBoards().refresh();

	return { success: true, board: newBoard };
});

export const updateBoardTitle = command(updateBoardSchema, async (params) => {
	const db = await readDB();
	const board = db.boards.find((b) => b.id === params.id);
	if (!board) throw new Error('Board not found');

	board.title = params.title;
	await writeDB(db);
	await getBoards().refresh();
	await getBoardById({ id: params.id }).refresh();
});

export const deleteBoard = command(object({ id: string() }), async (params) => {
	const db = await readDB();
	const boardExists = db.boards.some((b) => b.id === params.id);
	if (!boardExists) throw new Error('Board not found');

	db.boards = db.boards.filter((b) => b.id !== params.id);
	await writeDB(db);

	await getBoards().refresh();
});

// COLUMNS
export const createColumn = form(
	columnSchema,
	async (data: { boardId: string; title: string }, invalid) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === data.boardId);
		if (!board) throw new Error('Board not found');

		// Check if column with same title
		const existingColumn = board.columns.find(
			(c) => c.title.toLowerCase() === data.title.toLowerCase()
		);
		if (existingColumn) {
			invalid(invalid.title('A column with this title already exists in this board'));
		}

		const newColumn = { id: nanoid(), title: data.title, cards: [] };
		board.columns.push(newColumn);
		await writeDB(db);
		await getBoardById({ id: data.boardId }).refresh();
		return { success: true, column: newColumn };
	}
);

export const updateColumn = command(updateColumnSchema, async (params) => {
	const db = await readDB();
	const board = db.boards.find((b) => b.id === params.boardId);
	if (!board) throw new Error('Board not found');

	const column = board.columns.find((c) => c.id === params.columnId);
	if (!column) throw new Error('Column not found');

	column.title = params.title;
	await writeDB(db);
	await getBoardById({ id: params.boardId }).refresh();
});

export const deleteColumn = command(
	object({ boardId: string(), columnId: string() }),
	async (params) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === params.boardId);
		if (!board) throw new Error('Board not found');

		board.columns = board.columns.filter((c) => c.id !== params.columnId);
		await writeDB(db);
		await getBoardById({ id: params.boardId }).refresh();
	}
);

// CARDS
export const createCard = form(
	cardSchema,
	async (data: { boardId: string; columnId: string; content: string }) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === data.boardId);
		if (!board) throw new Error('Board not found');

		const column = board.columns.find((c) => c.id === data.columnId);
		if (!column) throw new Error('Column not found');

		const newCard = { id: nanoid(), content: data.content };
		column.cards.push(newCard);
		await writeDB(db);
		await getBoardById({ id: data.boardId }).refresh();
		return { success: true, card: newCard };
	}
);

export const updateCard = command(updateCardSchema, async (params) => {
	const db = await readDB();
	const board = db.boards.find((b) => b.id === params.boardId);
	if (!board) throw new Error('Board not found');

	const column = board.columns.find((c) => c.id === params.columnId);
	if (!column) throw new Error('Column not found');

	const card = column.cards.find((c) => c.id === params.cardId);
	if (!card) throw new Error('Card not found');

	card.content = params.content;
	await writeDB(db);
	await getBoardById({ id: params.boardId }).refresh();
});

export const deleteCard = command(
	object({ boardId: string(), columnId: string(), cardId: string() }),
	async (params) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === params.boardId);
		if (!board) throw new Error('Board not found');

		const column = board.columns.find((c) => c.id === params.columnId);
		if (!column) throw new Error('Column not found');

		column.cards = column.cards.filter((c) => c.id !== params.cardId);
		await writeDB(db);
		await getBoardById({ id: params.boardId }).refresh();
	}
);

// reorder cards within the same column
export const reorderCards = command(reorderCardsSchema, async (params) => {
	const { boardId, columnId, newOrder } = params;
	const db = await readDB();
	const board = db.boards.find((b) => b.id === boardId);
	if (!board) throw new Error('Board not found');

	const column = board.columns.find((c) => c.id === columnId);
	if (!column) throw new Error('Column not found');

	// Reorder cards based on newOrder array
	const reorderedCards = [];
	for (const cardId of newOrder) {
		const card = column.cards.find((c) => c.id === cardId);
		if (card) reorderedCards.push(card);
	}
	column.cards = reorderedCards;

	await writeDB(db);
	await getBoardById({ id: boardId }).refresh();
	return column.cards;
});
// move card between columns
export const moveCard = command(moveCardSchema, async (params) => {
	const { boardId, cardId, toColumnId, newOrder } = params;
	const db = await readDB();
	const board = db.boards.find((b) => b.id === boardId);
	if (!board) throw new Error('Board not found');

	// Remove from any column
	let card;
	for (const col of board.columns) {
		const idx = col.cards.findIndex((c) => c.id === cardId);
		if (idx !== -1) {
			card = col.cards.splice(idx, 1)[0];
			break;
		}
	}
	if (!card) throw new Error('Task not found');

	// Add to target column in correct order
	const targetColumn = board.columns.find((c) => c.id === toColumnId);
	if (!targetColumn) throw new Error('Column not found');

	// Insert back in the order of newOrder
	const reorderedCards = [];
	for (const id of newOrder) {
		if (id === card.id) reorderedCards.push(card);
		else {
			const existing = targetColumn.cards.find((c) => c.id === id);
			if (existing) reorderedCards.push(existing);
		}
	}
	targetColumn.cards = reorderedCards;

	await writeDB(db);
	await getBoardById({ id: boardId }).refresh();
	return targetColumn.cards;
});
