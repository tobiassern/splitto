<script lang="ts">
	import UpdateNameForm from './(components)/update-name-form.svelte';
	import UpdateCurrencyForm from './(components)/update-currency-form.svelte';
	import DeleteGroupForm from './(components)/delete-group-form.svelte';
	import ManageTags from './(components)/manage-tags.svelte';
	export let data;
</script>

<UpdateNameForm data={data.update_group_name_form} />
<UpdateCurrencyForm data={data.update_group_currency_form} />
<ManageTags
	update_tag_form={data.update_tag_form}
	create_tag_form={data.create_tag_form}
	tags={data.tags}
/>
<DeleteGroupForm />
