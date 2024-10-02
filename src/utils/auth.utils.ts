import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { validate } from 'class-validator';

export const hash = (i: string) => hashSync(i, (8).random + 4),
	validation = async (check: object, then: Function) => {
		const errors = Object.assign(
			{},
			...(await validate(check)).map((i) => i.constraints),
		) as Object;
		if (!Object.keys(errors).length) return await then();
		else throw new BadRequestException(JSON.stringify(errors));
	};

export class Cryption {
	constructor(
		private algorithm: string,
		private svrScr: string,
	) {}

	sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	encrypt(text: string, key = this.svrScr) {
		const iv = randomBytes(16),
			cipher = createCipheriv(this.algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
		return iv.toString('hex') + encrypted.toString('hex');
	}

	decrypt(encryptedText: string, key = this.svrScr) {
		if (!encryptedText) return '';
		const iv = Buffer.from(encryptedText.substring(0, 32), 'hex'),
			encrypted = Buffer.from(encryptedText.substring(32), 'hex'),
			decipher = createDecipheriv(this.algorithm, this.sigToKey(key), iv),
			decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return decrypted.toString();
	}
}
