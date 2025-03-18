const url = 'localhost:3000/docs';

describe('Api page test', () => {
	it('visitable', () =>
		cy
			.visit(url)
			.get('.d-none > compodoc-menu > nav > .list > .title > a')
			.should('have.text', 'project_w documentation'));
});
