import { sendGQL } from 'app/utils/test.utils';
import {
	AssignNotification,
	AssignNotificationMutation,
	AssignNotificationMutationVariables,
} from 'build/compiled_graphql';
import { Notification } from './notification.entity';
import { OutgoingHttpHeaders } from 'http';

export async function assignNoti(
	notification: Notification,
	headers: OutgoingHttpHeaders,
) {
	return await sendGQL<
		AssignNotificationMutation,
		AssignNotificationMutationVariables
	>(AssignNotification)({ input: notification }, { headers: headers });
}
