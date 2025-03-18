import ms from 'smtp-tester';

export default (
	on: Cypress.PluginEvents,
	config: Cypress.PluginConfigOptions,
) => {
	// starts the SMTP server at localhost:7777
	const port = 7777,
		mailServer = ms.init(port);

	// [receiver email]: email text
	let lastEmail = {};

	// process all emails
	mailServer.bind((addr, id, { html, headers }) => {
		lastEmail[headers.to as string] = html;
	});

	on('task', {
		resetEmails(email: string) {
			if (email) delete lastEmail[email];
			else lastEmail = {};

			return null;
		},

		getLastEmail(email: string) {
			return lastEmail[email] || null;
		},
	});
};
