const url = 'localhost:3000/docs';

describe('Api page test', () => {
	it('visitable', () => cy.visit(url));
});
