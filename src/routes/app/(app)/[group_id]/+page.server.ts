import type { PageServerLoad } from './$types';
import { isGroupMember } from '$lib/helpers';
import { tagsTable, transactionSplitsTable, transactionTagsTable, transactionsTable } from '$lib/schema';
import { eq, sum, and, sql, between, or, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { group } = isGroupMember(event);
	const group_member_id = event.url.searchParams.get('member') ? Number(event.url.searchParams.get('member')) : undefined;
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
		.where(and(eq(transactionsTable.group_id, group.id), eq(transactionSplitsTable.type, 'credit'), eq(transactionsTable.type, 'expense'), between(transactionsTable.when, firstDayOfMonth, lastDayOfMonth), group_member_id ? eq(transactionSplitsTable.group_member_id, group_member_id) : undefined))
		.groupBy(transactionsTable.group_id);
	const [total_week] = await event.locals.db.select({
		amount: sum(transactionSplitsTable.amount)
	}).from(transactionSplitsTable)
		.leftJoin(transactionsTable, eq(transactionsTable.id, transactionSplitsTable.transaction_id))
		.where(and(eq(transactionsTable.group_id, group.id), eq(transactionSplitsTable.type, 'credit'), eq(transactionsTable.type, 'expense'), between(transactionsTable.when, firstDayOfWeek, lastDayOfWeek), group_member_id ? eq(transactionSplitsTable.group_member_id, group_member_id) : undefined))
		.groupBy(transactionsTable.group_id);
	return {
		total_week,
		total_month,
		tags_amount: await event.locals.db.select({ monthly_budget: tagsTable.monthly_budget, id: tagsTable.id, label: tagsTable.label, amount: sum(transactionSplitsTable.amount) }).from(tagsTable).leftJoin(transactionTagsTable, eq(tagsTable.id, transactionTagsTable.tag_id)).leftJoin(transactionsTable, eq(transactionsTable.id, transactionTagsTable.transaction_id)).leftJoin(transactionSplitsTable, eq(transactionSplitsTable.transaction_id, transactionsTable.id)).groupBy(tagsTable.id).
			where(or(and(eq(transactionSplitsTable.type, 'credit'), eq(transactionsTable.type, 'expense'), group_member_id ? eq(transactionSplitsTable.group_member_id, group_member_id) : undefined, between(transactionsTable.when, firstDayOfMonth, lastDayOfMonth), eq(tagsTable.group_id, group.id)), and(isNull(transactionsTable.type), eq(tagsTable.group_id, group.id))))
	};
};
