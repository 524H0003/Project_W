import { hash as sHash, verify, Options } from 'argon2';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import {
	CipherGCMTypes,
	createCipheriv,
	createDecipheriv,
	randomBytes,
} from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { IPayload } from 'auth/auth.interface';
import { h32 } from 'xxhashjs';

export type Argon2Options = Required<
	Pick<Options, 'hashLength' | 'parallelism' | 'timeCost' | 'memoryCost'>
>;

/**
 * Validator for class
 * @param {object} input - the object need to validate
 * @param {Function} then - The procedure aftermath
 * @return {Promise<T>}
 */
export async function validation<T>(
	input: object,
	then: () => Promise<T>,
): Promise<T> {
	const errors = Object.assign(
		{},
		...(await validate(input)).map((i) => i.constraints),
	) as object;

	if (!Object.keys(errors).length) return then();
	else throw new ServerException('Invalid', 'Entity', '');
}

/**
 * Password hash function
 * @param {string} input - The string need to hash
 * @param {Argon2Options} option - the option for hash
 * @return {string} Hashed string
 */
export async function passwordHashing(
	input: string,
	option: Argon2Options,
): Promise<string> {
	return sHash(input, option);
}

/**
 * Password hash function
 * @param {string} input - The string need to hash
 * @return {string} Hashed string
 */
export function dataHashing(input: string): string {
	const hash = h32(input, 0xabcd).toString(16);

	return hash.padStart(36, '0');
}

/**
 * Compare function
 * @param {string} origin - origin string
 * @param {string} input - hashed string
 * @return {boolean}
 */
export async function compare(origin: string, input: string): Promise<boolean> {
	try {
		return await verify(input, origin);
	} catch {
		return false;
	}
}

/**
 * Security service
 */
export class SecurityService {
	/**
	 * Encrypt encoding
	 */
	private encoding: BufferEncoding = 'base64url';

	/**
	 * Encrypt algorithm
	 */
	private algorithm: CipherGCMTypes = 'aes-256-gcm';

	/**
	 * Server secret
	 */
	private serverSecret = this.config.get('SERVER_SECRET');

	/**
	 * Encoding separator
	 */
	private separator = '$$';

	constructor(
		protected jwt: JwtService,
		protected config: ConfigService,
	) {}

	/**
	 * Refresh token signer
	 * @param {IPayload} payload - input id
	 */
	refresh({ refreshToken }: IPayload): string {
		const secret = this.config.get('REFRESH_SECRET'),
			expiresIn = this.config.get('REFRESH_EXPIRE');

		return this.jwt.sign({ refreshToken }, { secret, expiresIn });
	}

	/**
	 * Access token signer
	 * @param {IPayload} payload - input id
	 */
	access({ accessToken }: IPayload): string {
		const secret = this.config.get('ACCESS_SECRET'),
			expiresIn = this.config.get('ACCESS_EXPIRE');

		return this.jwt.sign({ accessToken }, { secret, expiresIn });
	}

	/**
	 * Verify token
	 * @param {string} input - input token
	 */
	verify(input: string, type: 'refresh' | 'access' = 'access'): IPayload {
		const access = this.config.get('ACCESS_SECRET'),
			refresh = this.config.get('REFRESH_SECRET');

		return this.jwt.verify(input, {
			secret: type === 'access' ? access : refresh,
		});
	}

	/**
	 * Convert signature to key
	 * @param {string} str - the signature to be converted
	 * @param {number} length - key length
	 */
	private sigToKey(str: string, length: number): string {
		return str.substring(0, length).padStart(length, '0');
	}

	/**
	 * Encrypt text
	 * @param {string} content - The text need to be encrypted
	 * @param {string} signature - The signature to encrypt text
	 * @return {string} The encrypted text
	 */
	encrypt(content: string, signature: string = this.serverSecret): string {
		const { encoding, algorithm, separator } = this,
			iv = randomBytes(16),
			cipher = createCipheriv(
				algorithm,
				this.sigToKey(signature, ~~algorithm.split('-')[1] / 8),
				iv,
			),
			encrypted = Buffer.concat([cipher.update(content), cipher.final()]),
			authTag = cipher.getAuthTag();
		return (
			iv.toString(encoding) +
			separator +
			encrypted.toString(encoding) +
			separator +
			authTag.toString(encoding)
		);
	}

	/**
	 * Decrypt text
	 * @param {string} input - The encrypted text
	 * @param {string} key - The key to decrypt text
	 * @return {string} The decrypted text
	 */
	decrypt(input: string, key: string = this.serverSecret): string {
		if (!input || !key) return '';
		const { encoding, algorithm, separator } = this,
			[iv, encrypted, authTag] = input.split(separator),
			decipher = createDecipheriv(
				algorithm,
				this.sigToKey(key, ~~algorithm.split('-')[1] / 8),
				Buffer.from(iv, encoding),
			);

		decipher.setAuthTag(Buffer.from(authTag, encoding));

		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(encrypted, encoding)),
			decipher.final(),
		]);

		return decrypted.toString();
	}
}
