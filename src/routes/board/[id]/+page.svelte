<script lang="ts">
	import { getBoardById, createColumn } from '$lib/api/kanban.remote';
	import Column from '$lib/components/Column.svelte';

	const { params }: { params: { id: string } } = $props();
	let board = $derived(await getBoardById({ id: params.id }));
	let error = $derived(board === null ? new Error('Board not found') : null);
</script>

<div class="board-container">
	<svelte:boundary>
		{#snippet pending()}
			<div class="loading">
				<h2>Loading board...</h2>
				<div class="spinner"></div>
			</div>
		{/snippet}

		{#snippet failed(err: unknown, reset: () => void)}
			<div class="error">
				<h2>Error Loading Board</h2>
				<p>{err instanceof Error ? err.message : 'Unknown error occurred'}</p>
				<button onclick={reset}>Retry</button>
			</div>
		{/snippet}

		{#if error}
			<div class="error">
				<h2>Error</h2>
				<p>{error.message}</p>
			</div>
		{:else if board}
			<div class="board-header">
				<h1 class="board-title">{board.title}</h1>
			</div>
			<div class="columns-container">
				{#each board.columns as column (column.id)}
					<Column boardId={board.id} {column} />
				{/each}
				{#if board}
					<div class="new-column">
						<form {...createColumn}>
							<input type="hidden" name="boardId" value={board.id} />
							<input name="title" placeholder="New column" required />
							<button type="submit">Add column</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<p>Board not found</p>
		{/if}
	</svelte:boundary>
</div>

<style>
	.board-container {
		padding: 1rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%);
		min-height: 100vh;
	}

	.board-header {
		margin-bottom: 2rem;
		padding: 0 0.5rem;
	}

	.board-title {
		margin: 0;
		font-size: 2.2rem;
		font-weight: 800;
		color: #7b542f;
		text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
		letter-spacing: -0.02em;
	}

	.columns-container {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 1rem 0;
		min-height: 500px;
	}

	.new-column {
		flex: 0 0 280px;
		min-width: 280px;
		max-width: 400px;
		padding: 1rem;
		background: rgba(251, 191, 36, 0.3);
		border-radius: 12px;
		border: 2px dashed #d97706;
	}

	.new-column form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.new-column button {
		padding: 0.5rem 0.75rem;
		background: linear-gradient(145deg, #b6771d, #7b542f);
		color: white;
		font-size: 0.9rem;
		letter-spacing: 0.02em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
		font-family: inherit;
	}

	.new-column button:hover {
		background: linear-gradient(145deg, #b45309, #92400e);
		transform: translateY(-1px);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
	}

	.new-column input {
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #d97706;
		font-family: inherit;
		outline: none;
	}

	.new-column input {
		background: #fef3c7;
		color: #7b542f;
		font-weight: 500;
	}

	.new-column input:focus {
		border-color: #d97706;
		box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
	}

	/* Error and loading */
	.error {
		padding: 1rem;
		margin: 1rem;
		background-color: #fef2f2;
		border: 1px solid #fee2e2;
		border-radius: 8px;
		color: #991b1b;
	}

	.error h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
	}

	.error p {
		margin: 0;
	}

	.error button {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border-radius: 4px;
	}

	.error button:hover {
		background: #b91c1c;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		min-height: 200px;
	}

	.loading h2 {
		margin: 0 0 1rem 0;
		color: #7b542f;
		font-size: 1.5rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #fbbf24;
		border-top: 4px solid #d97706;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
