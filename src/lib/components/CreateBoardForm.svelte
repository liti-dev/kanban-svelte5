<script lang="ts">
	import { createBoard } from '$lib/api/kanban.remote';
	import { boardSchema } from '$lib/schemas/kanban';
</script>

<section class="create-board">
	<form class="create-board-form" {...createBoard.preflight(boardSchema)}>
		{#each createBoard.fields.title.issues() as issue}
			<p class="error-message">{issue.message}</p>
		{/each}
		<input {...createBoard.fields.title.as('text')} placeholder="New board title" required />
		<button type="submit" disabled={!!createBoard.pending}>
			{createBoard.pending ? 'Adding...' : 'Add board'}
		</button>
	</form>

	{#if createBoard.result?.success}
		<p class="success-message">Board "{createBoard.result.board.title}" created successfully!</p>
	{/if}
</section>

<style>
	.create-board {
		margin-bottom: 1rem;
	}

	.create-board-form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		max-width: 560px;
		background: linear-gradient(145deg, #fbbf24, #f59e0b);
		padding: 0.6rem;
		border-radius: 12px;
		border: 2px solid #d97706;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.create-board-form input[name='title'] {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		border: 1px solid #b6771d;
		background: #ffcf71;
		font-size: 1rem;
		outline: none;
		color: #7b542f;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.create-board-form input[name='title']:focus {
		border-color: #d97706;
		box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
	}

	.create-board-form button {
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 8px;
		background: linear-gradient(145deg, #b6771d, #7b542f);
		color: white;
		cursor: pointer;
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.02em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.create-board-form button:hover:not(:disabled) {
		background: linear-gradient(145deg, #b45309, #92400e);
		transform: translateY(-1px);
	}

	.create-board-form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.error-message {
		color: #991b1b;
		font-size: 0.875rem;
		margin: 0;
		padding: 0.25rem 0.5rem;
		background: rgba(254, 202, 202, 0.8);
		border-radius: 4px;
		border: 1px solid #fca5a5;
	}

	.success-message {
		color: #14532d;
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
		padding: 0.5rem;
		background: rgba(134, 239, 172, 0.8);
		border-radius: 4px;
		border: 1px solid #4ade80;
	}
</style>
