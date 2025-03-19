const url = 'http://localhost:3000/admin/login';

describe('Admin page test', () => {
	it('visitable', () => cy.visit(url));

	it('has request password button', () =>
		cy.visit(url).contains('Request password'));

	it('able to login', () => {
		cy.intercept('GET', '/admin/csrf-token')
			.as('csrfRequest')
			.intercept('POST', '/api/v1/request-signature')
			.as('signatureRequest');

		cy.visit(url)
			.wait('@csrfRequest')
			.get('input[name="email"]')
			.type('test@test.test');

		cy.contains('Request password').click().wait('@signatureRequest');

		cy.task('getLastEmail', 'test@test.test').then((html) => {
			cy.document().invoke('write', html);
			cy.get('.info-box').then(($ele) => {
				cy.visit(url)
					.wait('@csrfRequest')
					.get('input[name="email"]')
					.type('test@test.test')
					.get('input[name="password"]')
					.type(`${$ele[0].innerText}`)
					.get('.sc-hLseeU')
					.click()
					.get('div')
					.contains('test@test.test');
			});
		});
	});
});
