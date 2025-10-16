<script lang="ts">
	import { getBoards } from '$lib/api/kanban.remote';
	import Board from './Board.svelte';
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="loading">
			<p>Loading boards...</p>
			<div class="spinner"></div>
		</div>
	{/snippet}

	{#snippet failed(err: unknown, reset: () => void)}
		<div class="error">
			<h3>Failed to load boards</h3>
			<p>{err instanceof Error ? err.message : 'Unknown error occurred'}</p>
			<button onclick={reset}>Retry</button>
		</div>
	{/snippet}

	<ul class="boards-container">
		{#each await getBoards() as board}
			<Board {board} />
		{/each}
	</ul>
</svelte:boundary>

<style>
	.boards-container {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 1rem 0;
		min-height: 180px;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		min-height: 180px;
	}

	.loading p {
		margin: 0 0 1rem 0;
		color: #7b542f;
		font-size: 1.1rem;
	}

	.spinner {
		width: 30px;
		height: 30px;
		border: 3px solid #fbbf24;
		border-top: 3px solid #d97706;
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

	.error {
		padding: 1rem;
		margin: 1rem;
		background-color: #fef2f2;
		border: 1px solid #fee2e2;
		border-radius: 8px;
		color: #991b1b;
		text-align: center;
	}

	.error h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
	}

	.error p {
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}

	.error button {
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
</style>
