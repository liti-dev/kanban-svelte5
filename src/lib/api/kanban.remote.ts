import { query, form, command } from '$app/server';
import { readDB, writeDB } from './db';
import { object, string, minLength, pipe } from 'valibot';
import { nanoid } from 'nanoid';

const boardSchema = object({
	title: pipe(string(), minLength(1, 'Title required'))
});

const columnSchema = object({
	boardId: string(),
	title: pipe(string(), minLength(1, 'Title required'))
});

const cardSchema = object({
	boardId: string(),
	columnId: string(),
	content: pipe(string(), minLength(1, 'Content required'))
});

// BOARDS
export const getBoards = query(async () => {
	const db = await readDB();
	return db.boards;
});

export const getBoardById = query(object({ id: string() }), async (params) => {
	const db = await readDB();
	return db.boards.find((b) => b.id === params.id) ?? null;
});

export const createBoard = form(boardSchema, async (data: { title: string }) => {
	const db = await readDB();
	const newBoard = { id: nanoid(), title: data.title, columns: [] };
	db.boards.push(newBoard);
	await writeDB(db);
	await getBoards().refresh();
});

export const updateBoardTitle = command(
	object({ id: string(), title: string() }),
	async (params) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === params.id);
		if (!board) throw new Error('Board not found');
		board.title = params.title;
		await writeDB(db);
		await getBoards().refresh();
	}
);

export const deleteBoard = command(object({ id: string() }), async (params) => {
	const db = await readDB();
	db.boards = db.boards.filter((b) => b.id !== params.id);
	await writeDB(db);
	await getBoards().refresh();
});

// COLUMNS
export const createColumn = form(columnSchema, async (data: { boardId: string; title: string }) => {
	const db = await readDB();
	const board = db.boards.find((b) => b.id === data.boardId);
	if (!board) throw new Error('Board not found');

	const newColumn = { id: nanoid(), title: data.title, cards: [] };
	board.columns.push(newColumn);
	await writeDB(db);
	await getBoardById({ id: data.boardId }).refresh();
	return newColumn;
});

export const updateColumn = command(
	object({
		boardId: string(),
		columnId: string(),
		title: pipe(string(), minLength(1, 'Title required'))
	}),
	async (params) => {
		const db = await readDB();
		const board = db.boards.find((b) => b.id === params.boardId);
		if (!board) throw new Error('Board not found');

		const column = board.columns.find((c) => c.id === params.columnId);
		if (!column) throw new Error('Column not found');

		column.title = params.title;
		await writeDB(db);
		await getBoardById({ id: params.boardId }).refresh();
	}
);

export const deleteColumn = command(
	object({
		boardId: string(),
		columnId: string()
	}),
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
		return newCard;
	}
);

export const updateCard = command(
	object({
		boardId: string(),
		columnId: string(),
		cardId: string(),
		content: pipe(string(), minLength(1, 'Content required'))
	}),
	async (params) => {
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
	}
);

export const deleteCard = command(
	object({
		boardId: string(),
		columnId: string(),
		cardId: string()
	}),
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
