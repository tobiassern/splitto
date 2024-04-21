import { isGroupMember } from '$lib/helpers';
import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from '../$types';
import { zod } from 'sveltekit-superforms/adapters';
import {
	create_expense_schema,
	create_settlement_schema,
	insert_group_member_schema
} from '$lib/schema';
export const load: LayoutServerLoad = async (event) => {
	const { user, group } = isGroupMember(event);

	return {
		group,
		create_expense_form: await superValidate(
			{
				group_member_id: group.members.find((member) => member.user_id === user.id)?.id,
				splits: group.members.map((member) => {
					return { amount: null, group_member_id: member.id };
				})
			},
			zod(create_expense_schema),
			{ id: 'create-expense-form', errors: false }
		),
		create_settlement_form: await superValidate(zod(create_settlement_schema), {
			id: 'create-settlement-form'
		}),
		create_group_member_form: await superValidate(zod(insert_group_member_schema), {
			id: 'create-group-member-form'
		})
	};
};
