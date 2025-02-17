import ms from 'smtp-tester';

module.exports = (on, config) => {
	// starts the SMTP server at localhost:7777
	const port = 7777;
	const mailServer = ms.init(port);
	console.log('mail server at port %d', port);

	// process all emails
	mailServer.bind((addr, id, email) => {
		console.log('--- email ---');
		console.log(addr, id, email);
	});
};
