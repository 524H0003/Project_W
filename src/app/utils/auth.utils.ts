import { hash as sHash, verify, Options } from 'argon2';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

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
 * Hash function
 * @param {string} input - The string need to hash
 * @param {Argon2Options} option - the option for hash
 * @return {string} Hashed string
 */
export async function hashing(
	input: string,
	option: Argon2Options,
): Promise<string> {
	return sHash(input, option);
}

/**
 * Compare function
 * @param {string} origin - origin string
 * @param {string} input - hashed string
 * @return {boolean}
 */
export async function compare(origin: string, input: string): Promise<boolean> {
	try {
		return verify(input, origin);
	} catch {
		return false;
	}
}

/**
 * Security service
 */
export class SecurityService {
	/**
	 * Encrypt separator
	 */
	private separator = '%';

	/**
	 * Encrypt encoding
	 */
	private encoding: BufferEncoding = 'base64url';

	/**
	 * Encrypt algorithm
	 */
	private algorithm = this.config.get('AES_ALGO');

	constructor(
		protected jwt: JwtService,
		protected config: ConfigService,
	) {}

	/**
	 * Refresh token signer
	 * @param {string} id - input id
	 * @return {string} refresh token
	 */
	refresh(id: string): string {
		const { get } = this.config,
			secret = get('REFRESH_SECRET'),
			expiresIn = get('REFRESH_EXPIRE');

		return this.jwt.sign({ id }, { secret, expiresIn });
	}

	/**
	 * Access token signer
	 * @param {string} id - input id
	 * @return {string} access token
	 */
	access(id: string): string {
		const secret = this.config.get('ACCESS_SECRET'),
			expiresIn = this.config.get('ACCESS_EXPIRE');

		return this.jwt.sign({ id }, { secret, expiresIn });
	}

	/**
	 * Verify token
	 * @param {string} input - input token
	 */
	verify(input: string, type: 'refresh' | 'access' = 'access'): object {
		const access = this.config.get('ACCESS_SECRET'),
			refresh = this.config.get('REFRESH_SECRET');

		return this.jwt.verify(input, {
			secret: type === 'access' ? access : refresh,
		});
	}

	/**
	 * Convert signature to key
	 * @param {string} str - the signature to be converted
	 * @return {string} the key have been converted
	 */
	private sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	/**
	 * Encrypt text
	 * @param {string} input - The text need to be encrypted
	 * @param {string} key - The key to encrypt text
	 * @return {string} The encrypted text
	 */
	encrypt(
		input: string,
		key: string = this.config.get('SERVER_SECRET'),
	): string {
		const { encoding, separator, algorithm } = this,
			iv = randomBytes(10 + (6).random),
			cipher = createCipheriv(algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
		return encrypted.toString(encoding) + separator + iv.toString(encoding);
	}

	/**
	 * Decrypt text
	 * @param {string} input - The encrypted text
	 * @param {string} key - The key to decrypt text
	 * @return {string} The decrypted text
	 */
	decrypt(
		input: string,
		key: string = this.config.get('SERVER_SECRET'),
	): string {
		if (!input) return '';
		const { encoding, separator, algorithm } = this,
			[content, header] = input.split(separator),
			decipher = createDecipheriv(
				algorithm,
				this.sigToKey(key),
				Buffer.from(header, encoding),
			),
			decrypted = Buffer.concat([
				decipher.update(Buffer.from(content, encoding)),
				decipher.final(),
			]);
		return decrypted.toString();
	}
}
