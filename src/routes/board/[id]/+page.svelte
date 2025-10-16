<script lang="ts">
	import { getBoardById, createColumn } from '$lib/api/kanban.remote';
	import Column from '$lib/components/Column.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { Column as ColumnType } from '$lib/types';

	const { params }: { params: { id: string } } = $props();

	function handleCardMove(
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
		newIndex: number
	) {
		console.log(`Moving card ${cardId} from ${fromColumnId} to ${toColumnId} at index ${newIndex}`);
	}

	// Local state for drag operations
	let dragColumns = $state<ColumnType[]>([]);

	function handleColumnConsider(e: CustomEvent) {
		dragColumns = e.detail.items;
	}

	function handleColumnFinalize(e: CustomEvent) {
		dragColumns = e.detail.items;
		console.log(
			'Column order changed:',
			dragColumns.map((c) => c.title)
		);
	}
</script>

<div class="board-container">
	<svelte:boundary>
		{#snippet pending()}
			<div class="loading">
				<h2>Loading board...</h2>
				<div class="spinner"></div>
			</div>
		{/snippet}

		{#snippet failed(error)}
			<div class="error">
				<h2>Error</h2>
				<p>{error instanceof Error ? error.message : 'Failed to load board'}</p>
			</div>
		{/snippet}

		{@const board = await getBoardById({ id: params.id })}
		{@const columns = board?.columns?.map((col: ColumnType) => ({ ...col, id: col.id })) ?? []}

		{#if board}
			<div class="board-header">
				<h1 class="board-title">{board.title}</h1>
			</div>
			<div
				class="columns-container"
				use:dndzone={{
					items: dragColumns.length > 0 ? dragColumns : columns,
					flipDurationMs: 300,
					dropTargetStyle: {},
					type: 'columns'
				}}
				onconsider={handleColumnConsider}
				onfinalize={handleColumnFinalize}
			>
				{#each dragColumns.length > 0 ? dragColumns : columns as column (column.id)}
					<div animate:flip={{ duration: 300 }}>
						<Column boardId={board.id} {column} onCardMove={handleCardMove} />
					</div>
				{/each}
				<div class="new-column">
					<form {...createColumn}>
						<input type="hidden" name="boardId" value={board.id} />
						<input name="title" placeholder="New column" required />
						<button type="submit">Add column</button>
					</form>
				</div>
			</div>
		{:else}
			<div class="error">
				<h2>Board not found</h2>
				<p>The requested board could not be found.</p>
			</div>
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
