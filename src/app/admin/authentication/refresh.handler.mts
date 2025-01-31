import { AuthenticationOptions } from '@adminjs/fastify';
import AdminJS, { CurrentAdmin } from 'adminjs';
import { FastifyInstance } from 'fastify';
import { WrongArgumentError } from '../types.mjs';

const getRefreshTokenPath = (admin: AdminJS) => {
	const { refreshTokenPath, rootPath } = admin.options;
	const normalizedRefreshTokenPath = refreshTokenPath.replace(rootPath, '');

	return normalizedRefreshTokenPath.startsWith('/')
		? normalizedRefreshTokenPath
		: `/${normalizedRefreshTokenPath}`;
};

const MISSING_PROVIDER_ERROR =
	'"provider" has to be configured to use refresh token mechanism';

export const withRefresh = (
	fastifyApp: FastifyInstance,
	admin: AdminJS,
	auth: AuthenticationOptions,
	sessionId: string,
): void => {
	const refreshTokenPath = getRefreshTokenPath(admin);

	const { provider } = auth;

	fastifyApp.post(refreshTokenPath, async (request, reply) => {
		if (!provider) {
			throw new WrongArgumentError(MISSING_PROVIDER_ERROR);
		}

		const updatedAuthInfo = await provider.handleRefreshToken(
			{
				data: request.body ?? {},
				query: request.query ?? {},
				params: request.params ?? {},
				headers: request.headers,
			},
			{ request, reply },
		);

		let admin = request.session[sessionId] as Partial<CurrentAdmin> | null;
		if (!admin) {
			admin = {};
		}

		if (!admin._auth) {
			admin._auth = {};
		}

		admin._auth = {
			...admin._auth,
			...updatedAuthInfo,
		};

		request.session.set<any>(sessionId, admin);
		await request.session.save();
		return reply.send(admin);
	});
};
