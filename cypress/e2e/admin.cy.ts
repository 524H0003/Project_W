const url = 'localhost:3000/admin';

describe('Admin page test', () => {
	it('visitable', () => cy.visit(url));

	it('has request password button', () =>
		cy.visit(url).contains('Request password'));
});
