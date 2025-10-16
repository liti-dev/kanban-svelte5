<script lang="ts">
	import {
		getBoardById,
		createCard,
		deleteCard,
		updateCard,
		createColumn,
		updateColumn,
		deleteColumn
	} from '$lib/api/kanban.remote';

	const { params }: { params: { id: string } } = $props();
	let board = $derived(await getBoardById({ id: params.id }));
	let error = $derived(board === null ? new Error('Board not found') : null);

	let editingCardId: string | null = $state(null);
	let editingContent: string = $state('');

	let editingColumnId: string | null = $state(null);
	let editingColumnTitle: string = $state('');

	// card functions
	function startEditingCard(cardId: string, currentContent: string) {
		editingCardId = cardId;
		editingContent = currentContent;
	}

	function cancelEditing() {
		editingCardId = null;
		editingContent = '';
	}

	async function saveCardEdit(boardId: string, columnId: string, cardId: string) {
		if (!editingContent.trim()) return;

		try {
			await updateCard({
				boardId,
				columnId,
				cardId,
				content: editingContent.trim()
			});
			editingCardId = null;
			editingContent = '';
		} catch (error) {
			console.error('Failed to update card:', error);
		}
	}

	// Edit column functions
	function startEditingColumn(columnId: string, currentTitle: string) {
		editingColumnId = columnId;
		editingColumnTitle = currentTitle;
	}

	function cancelColumnEditing() {
		editingColumnId = null;
		editingColumnTitle = '';
	}

	async function saveColumnEdit(boardId: string, columnId: string) {
		if (!editingColumnTitle.trim()) return;

		try {
			await updateColumn({
				boardId,
				columnId,
				title: editingColumnTitle.trim()
			});
			editingColumnId = null;
			editingColumnTitle = '';
		} catch (error) {
			console.error('Failed to update column:', error);
		}
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
												if (board) saveColumnEdit(board.id, column.id);
											} else if (e.key === 'Escape') {
												cancelColumnEditing();
											}
										}}
									/>
									<div class="column-edit-buttons">
										<button
											class="save-btn"
											onclick={() => {
												if (board) saveColumnEdit(board.id, column.id);
											}}
										>
											✓
										</button>
										<button class="cancel-btn" onclick={cancelColumnEditing}> ✕ </button>
									</div>
								</div>
							{:else}
								<h2 class="column-title">{column.title}</h2>
								<div class="column-buttons">
									<button
										class="edit-btn"
										onclick={() => startEditingColumn(column.id, column.title)}
									>
										✏️
									</button>
									<button
										class="delete-btn"
										onclick={async () => {
											if (!board) return;
											try {
												await deleteColumn({
													boardId: board.id,
													columnId: column.id
												});
											} catch (error) {
												console.error('Failed to delete column:', error);
												alert('Failed to delete column. Please try again.');
											}
										}}
									>
										🗑
									</button>
								</div>
							{/if}
						</div>
						<div class="cards-container">
							{#each column.cards as card (card.id)}
								<div class="card">
									{#if editingCardId === card.id}
										<div class="card-edit-form">
											<textarea
												bind:value={editingContent}
												class="card-edit-input"
												onkeydown={(e) => {
													if (e.key === 'Enter' && !e.shiftKey) {
														e.preventDefault();
														if (board) saveCardEdit(board.id, column.id, card.id);
													} else if (e.key === 'Escape') {
														cancelEditing();
													}
												}}
											></textarea>
											<div class="card-edit-buttons">
												<button
													class="save-btn"
													onclick={() => {
														if (board) saveCardEdit(board.id, column.id, card.id);
													}}
												>
													✓
												</button>
												<button class="cancel-btn" onclick={cancelEditing}> ✕ </button>
											</div>
										</div>
									{:else}
										<p class="card-content">{card.content}</p>
										<div class="card-buttons">
											<button
												class="edit-btn"
												onclick={() => startEditingCard(card.id, card.content)}
											>
												✏️
											</button>
											<button
												class="delete-btn"
												onclick={async () => {
													if (!board) return;
													try {
														await deleteCard({
															boardId: board.id,
															columnId: column.id,
															cardId: card.id
														});
													} catch (error) {
														console.error('Failed to delete card:', error);
														alert('Failed to delete card. Please try again.');
													}
												}}
											>
												🗑
											</button>
										</div>
									{/if}
								</div>
							{/each}
						</div>
						{#if board}
							<form {...createCard.for(column.id)}>
								<input type="hidden" name="boardId" value={board.id} />
								<input type="hidden" name="columnId" value={column.id} />
								<input name="content" placeholder="New task" required />
								<button type="submit">Add</button>
							</form>
						{/if}
					</div>
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

	.column-buttons {
		display: flex;
		gap: 0.25rem;
	}

	.column-edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.column-edit-input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 1.2rem;
		font-weight: 600;
		font-family: inherit;
		outline: none;
	}

	.column-edit-input:focus {
		border-color: #d97706;
		box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
	}

	.column-edit-buttons {
		display: flex;
		gap: 0.25rem;
		justify-content: flex-end;
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

	.new-column input {
		padding: 0.5rem;
		border: 1px solid #d97706;
		border-radius: 6px;
		font-size: 1rem;
		background: #fef3c7;
	}

	.new-column button {
		padding: 0.5rem;
		background: linear-gradient(145deg, #b6771d, #7b542f);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.02em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.new-column button:hover {
		background: linear-gradient(145deg, #b45309, #92400e);
		transform: translateY(-1px);
	}

	.cards-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-height: 200px;
		overflow-y: auto;
		padding: 0.5rem;
	}

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

	.card-buttons {
		display: flex;
		gap: 0.25rem;
	}

	.edit-btn,
	.delete-btn {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
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

	.card-edit-buttons {
		display: flex;
		gap: 0.25rem;
		justify-content: flex-end;
	}

	.save-btn,
	.cancel-btn {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		transition: all 0.2s;
	}

	.save-btn {
		background: linear-gradient(145deg, #86efac, #4ade80);
		color: #14532d;
		font-weight: 600;
	}

	.save-btn:hover {
		background: linear-gradient(145deg, #4ade80, #22c55e);
		transform: scale(1.05);
	}

	.cancel-btn {
		background: linear-gradient(145deg, #fecaca, #fca5a5);
		color: #991b1b;
		font-weight: 600;
	}

	.cancel-btn:hover {
		background: linear-gradient(145deg, #fca5a5, #f87171);
		transform: scale(1.05);
	}

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
		font-size: 1rem;
	}

	.error button {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
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
