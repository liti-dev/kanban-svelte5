import { object, string, minLength, pipe, array } from 'valibot';

export const boardSchema = object({
	title: pipe(
		string(),
		minLength(1, 'Board title is required'),
		minLength(2, 'Board title must be at least 2 characters')
	)
});

export const columnSchema = object({
	boardId: string(),
	title: pipe(
		string(),
		minLength(1, 'Column title is required'),
		minLength(2, 'Column title must be at least 2 characters')
	)
});

export const cardSchema = object({
	boardId: string(),
	columnId: string(),
	content: pipe(
		string(),
		minLength(1, 'Card content is required'),
		minLength(3, 'Card content must be at least 3 characters')
	)
});

export const updateBoardSchema = object({
	id: string(),
	title: pipe(
		string(),
		minLength(1, 'Board title is required'),
		minLength(2, 'Board title must be at least 2 characters')
	)
});

export const updateColumnSchema = object({
	boardId: string(),
	columnId: string(),
	title: pipe(
		string(),
		minLength(1, 'Column title is required'),
		minLength(2, 'Column title must be at least 2 characters')
	)
});

export const updateCardSchema = object({
	boardId: string(),
	columnId: string(),
	cardId: string(),
	content: pipe(
		string(),
		minLength(1, 'Card content is required'),
		minLength(3, 'Card content must be at least 3 characters')
	)
});

export const reorderCardsSchema = object({
	boardId: string(),
	columnId: string(),
	newOrder: array(string())
});

export const moveCardSchema = object({
	boardId: string(),
	cardId: string(),
	toColumnId: string(),
	newOrder: array(string())
});
