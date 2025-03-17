export const csrfUrl = '/csrf-token',
	getCsrfToken = async (prefix: string = '') =>
		(await (await fetch(prefix + csrfUrl, { method: 'GET' })).json()).token;
