<script lang="ts">
	import { getBoards } from '$lib/api/kanban.remote';
	import BoardCard from './BoardCard.svelte';
</script>

<ul class="boards-container">
	{#each await getBoards() as board}
		<BoardCard {board} />
	{/each}
</ul>

<style>
	.boards-container {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 1rem 0;
		min-height: 180px;
	}
</style>
