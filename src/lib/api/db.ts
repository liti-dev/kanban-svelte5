import fs from 'fs/promises';
import path from 'path';
import type { Board } from '$lib/types';

const DB_PATH = path.resolve(process.cwd(), 'db.json');

export type DB = { boards: Board[] };

export async function readDB(): Promise<DB> {
	try {
		const text = await fs.readFile(DB_PATH, 'utf-8');
		return JSON.parse(text) as DB;
	} catch (err) {
		console.error('Database read error:', err);
		// if file missing, init empty db
		const init = { boards: [] };
		await writeDB(init);
		return init;
	}
}

export async function writeDB(db: DB): Promise<void> {
	await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}
