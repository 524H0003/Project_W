import { JwtService } from '@nestjs/jwt';
import { initJest } from './test.utils';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from './auth.utils';
import { expect } from '@jest/globals';

let securityService: SecurityService;

beforeEach(async () => {
	const { module } = await initJest(),
		jwt = module.get(JwtService),
		config = module.get(ConfigService);

	securityService = new SecurityService(jwt, config);
});

describe('SecurityService', () => {
	it('encrypt and decrypt', () => {
		for (const size of ['128', '192', '256']) {
			const sampleText = (40).string;
			// @ts-ignore
			securityService['algorithm'] = 'aes-' + size + '-gcm';
			expect(
				securityService.decrypt(securityService.encrypt(sampleText)),
			).toEqual(sampleText);
		}
	});
});
