import ms from 'smtp-tester';

module.exports = (on, config) => {
	// starts the SMTP server at localhost:7777
	const port = 7777,
		mailServer = ms.init(port);

	// [receiver email]: email text
	let lastEmail = {};

	// process all emails
	mailServer.bind((addr, id, email) => {
		lastEmail[email.headers.to[0]] = email.html || email.body;
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
