import { AuthenticationOptions } from '@adminjs/fastify';
import AdminJS from 'adminjs';
import { FastifyInstance } from 'fastify';
import { AuthenticationContext } from '../types.mjs';

const getLoginPath = (admin: AdminJS): string => {
	const { loginPath } = admin.options;

	return loginPath.startsWith('/') ? loginPath : `/${loginPath}`;
};

export const withLogin = (
	fastifyInstance: FastifyInstance,
	admin: AdminJS,
	auth: AuthenticationOptions,
	sessionId: string,
): void => {
	const { rootPath } = admin.options;
	const loginPath = getLoginPath(admin);

	const { provider } = auth;
	const providerProps = provider?.getUiProps?.() ?? {};

	fastifyInstance.get(loginPath, async (req, reply) => {
		const baseProps = {
			action: admin.options.loginPath,
			errorMessage: null,
		};
		const login = await admin.renderLogin({
			...baseProps,
			...providerProps,
		});
		reply.type('text/html');
		return reply.send(login);
	});

	fastifyInstance.post(loginPath, async (req, reply) => {
		const context: AuthenticationContext = { request: req, reply };

		let adminUser: unknown;
		if (provider) {
			adminUser = await provider.handleLogin(
				{
					headers: req.headers,
					query: req.query ?? {},
					params: req.params ?? {},
					data: req.body ?? {},
				},
				context,
			);
		} else {
			const { email, password } = req.body as {
				email: string;
				password: string;
			};
			// "auth.authenticate" must always be defined if "auth.provider" isn't
			adminUser = await auth.authenticate!(email, password, context as any);
		}

		if (adminUser) {
			req.session.set<any>(sessionId, adminUser);

			return reply.redirect(req.session.redirectTo || rootPath, 302);
		} else {
			const login = await admin.renderLogin({
				action: admin.options.loginPath,
				errorMessage: 'invalidCredentials',
				...providerProps,
			});
			reply.type('text/html');
			return reply.send(login);
		}
	});
};
