<script lang="ts">
	import { deleteBoard } from '$lib/api/kanban.remote';

	interface Props {
		board: {
			id: string;
			title: string;
		};
	}

	let { board }: Props = $props();

	function handleDelete(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		deleteBoard({ id: board.id });
	}
</script>

<li class="board-card">
	<a href={`/board/${board.id}`} class="board-link">
		<span class="board-title">{board.title}</span>
		<div class="board-overlay"></div>
	</a>
	<div class="button-group">
		<button onclick={handleDelete} class="delete-btn"> 🗑 </button>
	</div>
</li>

<style>
	.board-card {
		flex: 0 0 220px;
		min-width: 200px;
		background: linear-gradient(145deg, #fef3c7, #fde68a);
		border-radius: 12px;
		padding: 1rem;
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.15),
			0 1px 3px rgba(0, 0, 0, 0.1);
		border: 2px solid #f59e0b;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		transition: all 0.2s ease;
	}

	.board-card:hover {
		transform: translateY(-5px);
		box-shadow:
			0 8px 25px rgba(0, 0, 0, 0.2),
			0 4px 10px rgba(0, 0, 0, 0.15);
	}

	.board-link {
		text-decoration: none;
		color: #7b542f;
		font-weight: 600;
		font-size: 1.1rem;
		position: static;
		display: flex;
		flex: 1;
		text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);
		letter-spacing: -0.01em;
		line-height: 1.3;
		align-items: center;
		justify-content: center;
	}

	.board-title {
		display: block;
		text-align: center;
	}

	.board-overlay {
		position: absolute;
		inset: 0;
		cursor: pointer;
		z-index: 1;
	}

	.button-group {
		position: relative;
		z-index: 2;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.delete-btn {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		background: linear-gradient(145deg, #fecaca, #fca5a5);
		color: #991b1b;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.delete-btn:hover {
		background: linear-gradient(145deg, #fca5a5, #f87171);
		transform: scale(1.05);
	}
</style>
