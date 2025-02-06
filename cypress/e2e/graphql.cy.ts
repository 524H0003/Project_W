const url = 'localhost:3000/graphql';

describe('Admin page test', () => {
	it('visitable', () => cy.visit(url));
});
