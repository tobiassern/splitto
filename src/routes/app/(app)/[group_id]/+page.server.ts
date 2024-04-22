import type { PageServerLoad } from './$types';
import { isGroupMember } from '$lib/helpers';
import { transactionSplitsTable, transactionsTable } from '$lib/schema';
import { eq, sum, and, sql, between } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);
	let date = new Date();
	let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	var first = date.getDate() - date.getDay(); // First day is the day of the month - the day of the week
	var last = first + 6; // last day is the first day + 6

	var firstDayOfWeek = new Date(date.setDate(first));
	var lastDayOfWeek = new Date(date.setDate(last));



	const [total_month] = await event.locals.db.select({
		amount: sum(transactionSplitsTable.amount)
	}).from(transactionSplitsTable)
		.leftJoin(transactionsTable, eq(transactionsTable.id, transactionSplitsTable.transaction_id))
		.where(and(eq(transactionsTable.group_id, group.id), eq(transactionSplitsTable.type, 'debit'), eq(transactionsTable.type, 'expense'), between(transactionsTable.when, firstDayOfMonth, lastDayOfMonth)))
		.groupBy(transactionsTable.group_id);
	const [total_week] = await event.locals.db.select({
		amount: sum(transactionSplitsTable.amount)
	}).from(transactionSplitsTable)
		.leftJoin(transactionsTable, eq(transactionsTable.id, transactionSplitsTable.transaction_id))
		.where(and(eq(transactionsTable.group_id, group.id), eq(transactionSplitsTable.type, 'debit'), eq(transactionsTable.type, 'expense'), between(transactionsTable.when, firstDayOfWeek, lastDayOfWeek)))
		.groupBy(transactionsTable.group_id);
	return {
		total_week,
		total_month
		// .groupBy(transactionsTable.group_id, sql`(STRFTIME('%m-%Y', ${transactionsTable.when}))`)
	};
};
