<script lang="ts">
	import { deleteCard, updateCard } from '$lib/api/kanban.remote';

	interface Props {
		boardId: string;
		columnId: string;
		card: {
			id: string;
			content: string;
		};
	}

	let { boardId, columnId, card }: Props = $props();

	let isEditing: boolean = $state(false);
	let editingContent: string = $state('');

	function startEditing() {
		isEditing = true;
		editingContent = card.content;
	}

	function cancelEditing() {
		isEditing = false;
		editingContent = '';
	}

	async function saveEdit() {
		if (!editingContent.trim()) return;

		try {
			await updateCard({
				boardId,
				columnId,
				cardId: card.id,
				content: editingContent.trim()
			});
			isEditing = false;
			editingContent = '';
		} catch (error) {
			console.error('Failed to update card:', error);
		}
	}

	async function handleDelete() {
		try {
			await deleteCard({
				boardId,
				columnId,
				cardId: card.id
			});
		} catch (error) {
			console.error('Failed to delete card:', error);
			alert('Failed to delete card. Please try again.');
		}
	}
</script>

<div class="card">
	{#if isEditing}
		<div class="card-edit-form">
			<textarea
				bind:value={editingContent}
				class="card-edit-input"
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						saveEdit();
					} else if (e.key === 'Escape') {
						cancelEditing();
					}
				}}
			></textarea>
			<div class="card-edit-buttons">
				<button class="save-btn" onclick={saveEdit}>✓</button>
				<button class="cancel-btn" onclick={cancelEditing}>✕</button>
			</div>
		</div>
	{:else}
		<p class="card-content">{card.content}</p>
		<div class="card-buttons">
			<button class="edit-btn" onclick={startEditing}>✏️</button>
			<button class="delete-btn" onclick={handleDelete}>🗑</button>
		</div>
	{/if}
</div>

<style>
	.card {
		background: linear-gradient(145deg, #fef3c7, #fde68a);
		border-radius: 8px;
		padding: 0.75rem;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.15),
			0 1px 2px rgba(0, 0, 0, 0.1);
		border: 1px solid #f59e0b;
		cursor: grab;
		user-select: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
	}

	.card:active {
		cursor: grabbing;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.2),
			0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.card-content {
		margin: 0;
		font-size: 0.95rem;
		color: #7b542f;
		line-height: 1.5;
		flex: 1;
		white-space: pre-wrap;
		font-weight: 500;
		text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);
	}

	.card-buttons,
	.card-edit-buttons {
		display: flex;
		gap: 0.25rem;
	}

	.card-edit-buttons {
		justify-content: flex-end;
	}

	.card-edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.card-edit-input {
		width: 100%;
		min-height: 60px;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.95rem;
		font-family: inherit;
		resize: vertical;
		outline: none;
	}

	.card-edit-input:focus {
		border-color: #d97706;
		box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
	}

	button {
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
		font-family: inherit;
	}

	.edit-btn,
	.delete-btn {
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
		padding: 0.25rem 0.5rem;
		background: linear-gradient(145deg, #86efac, #4ade80);
		color: #14532d;
		font-size: 0.9rem;
	}

	.save-btn:hover {
		background: linear-gradient(145deg, #4ade80, #22c55e);
		transform: scale(1.05);
	}

	.cancel-btn {
		padding: 0.25rem 0.5rem;
		background: linear-gradient(145deg, #fecaca, #fca5a5);
		color: #991b1b;
		font-size: 0.9rem;
	}

	.cancel-btn:hover {
		background: linear-gradient(145deg, #fca5a5, #f87171);
		transform: scale(1.05);
	}
</style>
