const url = 'localhost:3000/admin';

describe('Admin page test', () => {
	it('visitable', () => cy.visit(url));

	it('has request password button', () =>
		cy.visit(url).contains('Request password'));

	it('able to login', () => {
		cy.visit(url).contains('Request password').click();

		cy.task('getLastEmail', 'test@test.test')
			.its('body')
			.then(cy.wrap)
			.invoke('match', /code is (?<code>\w+)/);
	});
});
