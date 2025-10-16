<script lang="ts">
	import { createCard, updateColumn, deleteColumn } from '$lib/api/kanban.remote';
	import Card from './Card.svelte';

	interface Props {
		boardId: string;
		column: {
			id: string;
			title: string;
			cards: Array<{
				id: string;
				content: string;
			}>;
		};
	}

	let { boardId, column }: Props = $props();

	let editingColumnId: string | null = $state(null);
	let editingColumnTitle: string = $state('');

	function startEditingColumn() {
		editingColumnId = column.id;
		editingColumnTitle = column.title;
	}

	function cancelColumnEditing() {
		editingColumnId = null;
		editingColumnTitle = '';
	}

	async function saveColumnEdit() {
		if (!editingColumnTitle.trim()) return;

		try {
			await updateColumn({
				boardId,
				columnId: column.id,
				title: editingColumnTitle.trim()
			});
			editingColumnId = null;
			editingColumnTitle = '';
		} catch (error) {
			console.error('Failed to update column:', error);
		}
	}

	async function handleDeleteColumn() {
		try {
			await deleteColumn({
				boardId,
				columnId: column.id
			});
		} catch (error) {
			console.error('Failed to delete column:', error);
			alert('Failed to delete column. Please try again.');
		}
	}
</script>

<div class="column">
	<div class="column-header">
		{#if editingColumnId === column.id}
			<div class="column-edit-form">
				<input
					bind:value={editingColumnTitle}
					class="column-edit-input"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							saveColumnEdit();
						} else if (e.key === 'Escape') {
							cancelColumnEditing();
						}
					}}
				/>
				<div class="column-edit-buttons">
					<button class="save-btn" onclick={saveColumnEdit}>✓</button>
					<button class="cancel-btn" onclick={cancelColumnEditing}>✕</button>
				</div>
			</div>
		{:else}
			<h2 class="column-title">{column.title}</h2>
			<div class="column-buttons">
				<button class="edit-btn" onclick={startEditingColumn}>✏️</button>
				<button class="delete-btn" onclick={handleDeleteColumn}>🗑</button>
			</div>
		{/if}
	</div>

	<div class="cards-container">
		{#each column.cards as card (card.id)}
			<Card {boardId} columnId={column.id} {card} />
		{/each}
	</div>

	<form class="new-card-form" {...createCard.for(column.id)}>
		<input type="hidden" name="boardId" value={boardId} />
		<input type="hidden" name="columnId" value={column.id} />
		<input name="content" placeholder="New task" required />
		<button type="submit">Add</button>
	</form>
</div>

<style>
	.column {
		flex: 1 1 300px;
		min-width: 280px;
		max-width: 400px;
		background: linear-gradient(145deg, #fbbf24, #f59e0b);
		border-radius: 12px;
		padding: 1rem;
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.1),
			0 1px 3px rgba(0, 0, 0, 0.08);
		border: 2px solid #d97706;
	}

	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.column-title {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 700;
		color: white;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		letter-spacing: -0.01em;
	}

	.cards-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-height: 200px;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.new-card-form {
		background: linear-gradient(145deg, #fef3c7, #fde68a);
		border-radius: 8px;
		padding: 0.75rem;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.15),
			0 1px 2px rgba(0, 0, 0, 0.1);
		border: 1px solid #f59e0b;
		transition: all 0.2s ease;
	}

	.new-card-form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-top: 0.5rem;
		padding: 0.5rem;
	}

	/* Button groups */
	.column-buttons,
	.column-edit-buttons {
		display: flex;
		gap: 0.25rem;
	}

	.column-edit-buttons {
		justify-content: flex-end;
	}

	button {
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
		font-family: inherit;
	}

	.new-card-form button {
		padding: 0.5rem 0.75rem;
		background: linear-gradient(145deg, #b6771d, #7b542f);
		color: white;
		font-size: 0.9rem;
		letter-spacing: 0.02em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
	}

	.new-card-form button:hover {
		background: linear-gradient(145deg, #b45309, #92400e);
		transform: translateY(-1px);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
	}

	.edit-btn,
	.delete-btn,
	.save-btn,
	.cancel-btn {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.edit-btn {
		background: linear-gradient(145deg, #fed7aa, #fdba74);
		color: #9a3412;
	}

	.edit-btn:hover {
		background: linear-gradient(145deg, #fdba74, #fb923c);
		transform: scale(1.05);
	}

	.delete-btn {
		background: linear-gradient(145deg, #fecaca, #fca5a5);
		color: #991b1b;
	}

	.delete-btn:hover {
		background: linear-gradient(145deg, #fca5a5, #f87171);
		transform: scale(1.05);
	}

	.save-btn {
		background: linear-gradient(145deg, #86efac, #4ade80);
		color: #14532d;
	}

	.save-btn:hover {
		background: linear-gradient(145deg, #4ade80, #22c55e);
		transform: scale(1.05);
	}

	.cancel-btn {
		background: linear-gradient(145deg, #fecaca, #fca5a5);
		color: #991b1b;
	}

	.cancel-btn:hover {
		background: linear-gradient(145deg, #fca5a5, #f87171);
		transform: scale(1.05);
	}

	/* Form */
	.column-edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	input {
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #d97706;
		font-family: inherit;
		outline: none;
	}

	.new-card-form input[name='content'] {
		flex: 1;
		padding: 0.5rem 0.75rem;
		background: #ffcf71;
		color: #7b542f;
		font-weight: 500;
		font-size: 0.95rem;
		letter-spacing: 0.01em;
		text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);
	}

	.new-card-form input[name='content']::placeholder {
		color: #92400e;
		opacity: 0.7;
	}

	.column-edit-input {
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 1.2rem;
		font-weight: 600;
	}

	input:focus {
		border-color: #d97706;
		box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
	}

	.new-card-form input[name='content']:focus {
		border-color: #b45309;
		box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.2);
	}
</style>
