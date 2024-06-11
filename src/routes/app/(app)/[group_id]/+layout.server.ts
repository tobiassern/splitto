import { isGroupMember } from '$lib/helpers';
import { superValidate } from 'sveltekit-superforms';
import type { LayoutServerLoad } from '../$types';
import { zod } from 'sveltekit-superforms/adapters';
import {
	create_transaction_schema,
	insert_group_member_schema
} from '$lib/schema';
export const load: LayoutServerLoad = async (event) => {
	const { user, group } = isGroupMember(event);

	return {
		group,
		create_expense_form: await superValidate(
			{
				group_member_id: group.members.find((member) => member.user_id === user.id)?.id,
				when: new Date().toLocaleDateString('sv-SE'),
				splits: group.members.map((member) => {
					return {
						enabled: true,
						amount: null,
						group_member_id: member.id,
						email: member.user?.email ?? member.email,
						name: member.user?.name ?? member.name
					};
				})
			},
			zod(create_transaction_schema),
			{ id: 'create-expense-form', errors: false }
		),
		create_settlement_form: await superValidate(
			{ when: new Date().toLocaleDateString('sv-SE'), type: 'settlement' },
			zod(create_transaction_schema),
			{
				id: 'create-settlement-form'
			}
		),
		create_group_member_form: await superValidate(zod(insert_group_member_schema), {
			id: 'create-group-member-form'
		})
	};
};
