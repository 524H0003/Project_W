const url = 'localhost:3000/api';

describe('Api page test', () => {
	it('visitable', () =>
		cy.visit(url).get('.topbar-wrapper > .link').should('exist'));
});
