<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import type { DateRange } from 'bits-ui';
	import { page } from '$app/stores';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { goto } from '$app/navigation';

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	const dfSearchParam = new DateFormatter('sv-SE', {
		dateStyle: 'short'
	});

	let value: DateRange | undefined = {
		start: $page.url.searchParams.get('from')
			? parseDate($page.url.searchParams.get('from') as string)
			: undefined,
		end: $page.url.searchParams.get('to')
			? parseDate($page.url.searchParams.get('to') as string)
			: undefined
	};

	let startValue: DateValue | undefined = undefined;
</script>

<div class="grid gap-2">
	<Popover.Root
		openFocus
		onOpenChange={(isOpen) => {
			if (!isOpen) {
				const newUrl = new URL($page.url);
				if (value?.start && value?.end) {
					newUrl.searchParams.set(
						'from',
						dfSearchParam.format(value.start.toDate(getLocalTimeZone()))
					);
					newUrl.searchParams.set('to', dfSearchParam.format(value.end.toDate(getLocalTimeZone())));
				} else {
					newUrl.searchParams.delete('from');
					newUrl.searchParams.delete('to');
				}

				goto(newUrl);
			}
		}}
	>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				size="sm"
				class={cn('w-52 justify-start text-left font-normal', !value && 'text-muted-foreground')}
				builders={[builder]}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{#if value && value.start}
					{#if value.end}
						{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
							value.end.toDate(getLocalTimeZone())
						)}
					{:else}
						{df.format(value.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if startValue}
					{df.format(startValue.toDate(getLocalTimeZone()))}
					<span class="italic"> - Pick end date</span>
				{:else}
					Pick a date
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<RangeCalendar
				bind:value
				bind:startValue
				initialFocus
				numberOfMonths={2}
				placeholder={value?.start}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
