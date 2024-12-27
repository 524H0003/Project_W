import { sendGQL } from 'app/utils/test.utils';
import {
	AssignNotification,
	AssignNotificationMutation,
	AssignNotificationMutationVariables,
} from 'compiled_graphql';
import { Notification } from './notification.entity';

export async function assignNoti(notification: Notification, headers: object) {
	return await sendGQL<
		AssignNotificationMutation,
		AssignNotificationMutationVariables
	>(AssignNotification)({ input: notification }, headers['set-cookie']);
}
