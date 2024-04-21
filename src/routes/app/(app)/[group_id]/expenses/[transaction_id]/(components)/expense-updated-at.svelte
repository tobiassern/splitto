<script lang="ts">
	export let updated_at: Date | null;
</script>

<div class="text-xs text-muted-foreground">
	Updated <time dateTime="2023-11-23">{updated_at?.toLocaleString() ?? '-'}</time>
</div>
