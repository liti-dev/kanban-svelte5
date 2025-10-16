<script lang="ts">
	import CreateBoardForm from '$lib/components/CreateBoardForm.svelte';
	import BoardsList from '$lib/components/BoardsList.svelte';
</script>

<div class="boards-page">
	<h1 class="page-title">🎃 Tia's Harvest Boards</h1>

	<CreateBoardForm />
	<BoardsList />
</div>

<style>
	.boards-page {
		padding: 1rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%);
		min-height: 100vh;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: #7b542f;
		text-align: center;
		margin-bottom: 2rem;
		text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.3);
		letter-spacing: -0.02em;
	}
</style>
