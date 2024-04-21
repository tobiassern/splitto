<script lang="ts">
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Calendar from './calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Value } from 'svelte-radix';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	export let value: DateValue | undefined = undefined;
</script>

<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button
			variant="outline"
			class={cn('justify-start text-left font-normal', !value && 'text-muted-foreground')}
			builders={[builder]}
		>
			<CalendarIcon class="mr-2 h-4 w-4" />
			{value ? df.format(value.toDate(getLocalTimeZone())) : 'Pick a date'}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" align="start">
		<Calendar bind:value />
	</Popover.Content>
</Popover.Root>
