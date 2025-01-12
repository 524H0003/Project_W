import { compareSync, hashSync } from 'bcrypt';
import { validate } from 'class-validator';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

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
	) as Object;

	if (!Object.keys(errors).length) return then();
	else
		throw new ServerException('Invalid', 'Entity', '', JSON.stringify(errors));
}

/**
 * Hash function
 * @param {string} input - The string need to hash
 * @return {string} Hashed string
 */
export function hash(input: string): string {
	return hashSync(input, (8).random + 4).replaceAll('/', '*');
}

/**
 * Compare function
 * @param {string} origin - origin string
 * @param {string} input - hashed string
 * @return {boolean}
 */
export function compare(origin: string, input: string): boolean {
	return compareSync(origin, input.replaceAll('*', '/'));
}

/**
 * Cryption class
 */
export class Cryption {
	/**
	 * @ignore
	 */
	constructor(
		private algorithm: string,
		private svrScr: string,
	) {}

	/**
	 * Convert signature to key
	 * @param {string} str - the signature to be converted
	 * @return {string} the key have been converted
	 */
	sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	/**
	 * Encrypt text
	 * @param {string} input - The text need to be encrypted
	 * @param {string} key - The key to encrypt text
	 * @return {string} The encrypted text
	 */
	encrypt(input: string, key: string = this.svrScr): string {
		const iv = randomBytes(16),
			cipher = createCipheriv(this.algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
		return iv.toString('hex') + encrypted.toString('hex');
	}

	/**
	 * Decrypt text
	 * @param {string} input - The encrypted text
	 * @param {string} key - The key to decrypt text
	 * @return {string} The decrypted text
	 */
	decrypt(input: string, key: string = this.svrScr): string {
		if (!input) return '';
		const iv = Buffer.from(input.substring(0, 32), 'hex'),
			encrypted = Buffer.from(input.substring(32), 'hex'),
			decipher = createDecipheriv(this.algorithm, this.sigToKey(key), iv),
			decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return decrypted.toString();
	}
}
