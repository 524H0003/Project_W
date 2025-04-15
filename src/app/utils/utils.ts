import { IResult as MetaData } from 'ua-parser-js';

/**
 * Casting object to interface
 */
class InterfaceCasting<T, K extends keyof T> {
	[key: string]: any;

	/**
	 * Convert object to interface
	 * @param {T} input - the input object
	 * @param {K[]} get - the interface's properties
	 */
	constructor(input: T, get: readonly K[]) {
		get.forEach((_) => {
			if (typeof input[_] != 'undefined') this[String(_)] = input[_];
		});
	}

	/**
	 * Quick method to convert object to interface
	 * @param {T} input - the input object
	 * @param {K[]} get - the interface's properties
	 * @return {InterfaceCasting} the result of casting
	 */
	static quick<T, K extends keyof T>(input: T, get: readonly K[]): T {
		return new InterfaceCasting(input, get) as T;
	}

	/**
	 * Quick method to convert object to interface
	 * @param {T} input - the input object
	 * @param {K[]} get - the interface's properties
	 * @return {InterfaceCasting} the result of casting
	 */
	static delete<T, K extends keyof T>(input: T, get: readonly K[]): T {
		get.forEach((_) => delete input[_]);
		return input;
	}
}
/**
 * @ignore
 */
export const logMethodCall = methodDecorator({
		prerun: (target: any, propertyKey: Function, args: any) => {
			console.log(
				`Calling ${target.constructor.name}.${propertyKey.name} with arguments:`,
				args,
			);
		},
		postrun: (target: any, propertyKey: Function, result: any) => {
			console.log(
				`Result of ${target.constructor.name}.${propertyKey.name}:`,
				result,
			);
		},
	}),
	matching = <T>(input: T, required: T[]): boolean =>
		required.some((i) => i === input);

/**
 * Method decorator type
 */
type MethodDecorator = (
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor;

/**
 * Prerun method type
 */
type MethodPrerun = (target: any, propertyKey: Function, args: any) => void;

/**
 * Postrun method type
 */
type MethodPostrun = (target: any, propertyKey: Function, result: any) => void;

// Decorators
/**
 * A class decorator that get all functions in class and implement them a function declared in argument
 * @param {MethodDecorator} decorator - the function will implement to all functions in class
 */
export function allImplement(decorator: MethodDecorator) {
	return function (target: Function) {
		for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
			if (typeof target.prototype[propertyName] === 'function') {
				const descriptor = Object.getOwnPropertyDescriptor(
					target.prototype,
					propertyName,
				);
				Object.defineProperty(
					target.prototype,
					propertyName,
					decorator(target, propertyName, descriptor),
				);
			}
		}
	};
}

/**
 * Fix circular JSON
 */
export function censor(censor: any) {
	var i = 0;

	return function (key: any, value: any) {
		if (
			i !== 0 &&
			typeof censor === 'object' &&
			typeof value == 'object' &&
			censor == value
		)
			return '[Circular]';

		if (i >= 29) return '[Unknown]';

		++i;

		return value;
	};
}

/**
 * A function decorator that implements prerun and postrun functions
 * @param {Object} functions - A two-element array that contains prerun and postrun functions
 */
export function methodDecorator(functions: {
	prerun?: MethodPrerun;
	postrun?: MethodPostrun;
}): MethodDecorator {
	const { prerun = () => 0, postrun = () => 0 } = functions || {};
	return (
		_target: any,
		_propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: any) {
			prerun(this, originalMethod, args);
			const result = originalMethod.apply(this, args);
			postrun(this, originalMethod, result);
			return result;
		};
		return descriptor;
	};
}

// Defines
/**
 * @ignore
 */
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numChars = '0123456789';

declare global {
	/**
	 * Array interface
	 */
	interface Array<T> {
		/**
		 * Get random element
		 */
		readonly randomElement: T;
		/**
		 * Get elements contain substring
		 */
		get(subString: string): Array<T>;
		/**
		 * Get last element
		 */
		readonly lastElement: T;
	}
	/**
	 * Number interface
	 */
	interface Number {
		// number
		/**
		 * floor function
		 */
		readonly floor: number;
		/**
		 * round function
		 */
		readonly round: number;
		/**
		 * abs function
		 */
		readonly abs: number;

		// string
		/**
		 * Generate alpha string with length
		 */
		readonly alpha: string;
		/**
		 * Generate numeric string with length
		 */
		readonly numeric: string;
		/**
		 * Generate string with length
		 */
		readonly string: string;

		// file size
		/**
		 * megabyte to byte
		 */
		readonly mb2b: number;

		// time
		/**
		 * second to milisecond
		 */
		readonly s2ms: number;

		/**
		 * minute to second
		 */
		readonly m2s: number;

		/**
		 * hour to second
		 */
		readonly h2s: number;

		/**
		 * Get random number
		 */
		readonly random: number;
		/**
		 * range() # like Python's range()		 */
		range(input: () => Promise<any> | any): Promise<void>;
	}
	/**
	 * String interface
	 */
	interface String {
		/**
		 * Get random character
		 */
		readonly randomChar: string;
		/**
		 * To lower case
		 */
		readonly lower: string;
		/**
		 * To capitalize
		 */
		readonly capitalize: string;
		/**
		 * To uncapitalize
		 */
		readonly uncapitalize: string;
		/**
		 * Convert to base64url
		 */
		readonly toBase64Url: string;
		/**
		 * Convert from base64url
		 */
		readonly fromBase64Url: string;
		/**
		 * Reducing argon2 hash ouptut
		 */
		readonly redudeArgon2: string;
	}

	/**
	 * disable describe
	 * @param {string} name - describe name
	 * @param {() => void | Promise<void>} func - the body of describe
	 * @return {void}
	 */
	function disableDescribe(
		name: string,
		func: () => void | Promise<void>,
	): void;

	/**
	 * Return the formatted name of current file
	 * @param {string} file - the current file's name (must be __filename)	 * @param {number} cut - How many chunk should get (default: 2)	 * @return {string} formatted file's name
	 */
	function curFile(file: string, cut?: number): string;

	/**
	 * Return an array with length
	 * @param {number} length - the length of the array
	 * @param {any} initValue - the initial value for each element in array
	 * @return {any[]} the output array with length
	 */
	function array(length: number, initValue?: any): any[];

	/**
	 * Delay function
	 * @param {number} ms - delay in milisecond
	 */
	function delay(ms: number): Promise<void>;

	/**
	 * Error code generator
	 * @param {ErrorType} type - type of error
	 * @param {ErrorObject} object - object of error
	 * @param {ErrorAction} action - action to error
	 * @return {string}
	 */
	function err(
		type: ErrorType,
		object: ErrorObject,
		action: ErrorAction,
	): string;

	/**
	 * Get http exception status code
	 * @param {any} error - catched error
	 * @return {number}
	 */
	function errorStatus(error: any): number;

	/**
	 * Get current time
	 */
	function currentTime(): number;

	/**
	 * Sorting object keys
	 */
	function sortObjectKeys(input: object): object;

	/**
	 * Set relationship if not then null
	 */
	function setEntity<
		T extends new (...args: any[]) => R,
		R,
		K,
		U extends keyof K,
	>(
		entity: T,
		payload: ConstructorParameters<T>,
		destiny: K,
		property: U,
	): void;

	/**
	 * Compare client's metadata
	 * @param {MetaData} a - object
	 * @param {MetaData} b - target
	 */
	function compareMetaData(a: MetaData, b: MetaData): boolean;

	/**
	 * Sleep function
	 * @param {number} ms - sleep in milisecond
	 */
	function sleep(ms: number): Promise<void>;

	/**
	 * Interface casting class
	 */
	class InterfaceCasting<T, K extends keyof T> {
		constructor(input: T, get: readonly K[]);

		static quick<T, K extends keyof T>(input: T, get: readonly K[]): T;

		static delete<T, K extends keyof T>(input: T, get: readonly K[]): T;
	}
}

/**
 * Server error type
 */
export type ErrorType =
	| 'Invalid'
	| 'Success'
	| 'Fatal'
	| 'Forbidden'
	| 'Unauthorized';

/**
 * Server error object type
 */
export type ErrorObject =
	| 'Client'
	| 'ID'
	| 'Hash'
	| 'CsrfCookie'
	| 'CsrfToken'
	| 'User'
	| 'File'
	| 'AWS'
	| 'UserType'
	| 'Method'
	| 'FileName'
	| 'Notification'
	| 'Redis'
	| 'Email'
	| 'Hook'
	| 'Token'
	| 'Entity'
	| 'Signature'
	| 'Enterprise'
	| 'Event'
	| 'Password'
	| 'Input';

/**
 * Server error action type
 */
export type ErrorAction =
	| ''
	| 'Request'
	| 'Read'
	| 'Sent'
	| 'Implementation'
	| 'Upload'
	| 'Download'
	| 'SignUp'
	| 'Assign'
	| 'LogOut'
	| 'Access';

// Global functions
export const funcs = {
	currentTime: () => Math.floor(new Date().getTime() / 1000),
	err: (type: ErrorType, object: ErrorObject, action: ErrorAction) =>
		type + '_' + object + (action ? '_' : '') + action,
	// eslint-disable-next-line tsEslint/no-unused-vars
	disableDescribe: (_name: string, _func: () => void | Promise<void>) => {},
	curFile: (file: string, cut = 2) =>
		file
			.split(/\/|\\/)
			.lastElement.split('.')
			.map((w) => w[0].toUpperCase() + w.slice(1))
			.slice(0, cut)
			.join('') +
		'_' +
		(5).string,
	array: (length: number, initValue: any = '') =>
		Array(length)
			.join()
			.split(',')
			.map(() => initValue),
	delay: async (ms: number) => {
		await new Promise<void>((resolve) => setTimeout(() => resolve(), ms)).then(
			() => console.log('fired'),
		);
	},
	sortObjectKeys: (input: object) =>
		Object.keys(input)
			.sort()
			.reduce((obj, key) => {
				if (input[key] instanceof Object) obj[key] = sortObjectKeys(input[key]);
				else obj[key] = input[key];
				return obj;
			}, {}),
	setEntity: <
		T extends new (...args: any[]) => R,
		R extends K[U],
		K extends { [key in U]: R },
		U extends keyof K,
	>(
		entity: T,
		payload: ConstructorParameters<T>,
		destiny: K,
		property: U,
	): void => {
		payload = payload[0];
		if (payload && Object.keys(payload).length)
			destiny[property] = new entity(payload);
	},
	compareMetaData: (a: MetaData, b: MetaData) =>
		JSON.stringify(sortObjectKeys(a)) == JSON.stringify(sortObjectKeys(b)),
	sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
	InterfaceCasting,
};
Object.assign(globalThis, funcs);
// String.prototype
Object.defineProperty(String.prototype, 'toBase64Url', {
	get: function () {
		return Buffer.from(this as string, 'utf8').toString('base64url');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'fromBase64Url', {
	get: function () {
		return Buffer.from(this as string, 'base64url').toString('utf8');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'redudeArgon2', {
	get: function () {
		return (this as string).split('$').slice(-2).join('$');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'randomChar', {
	get: function () {
		return (this as string).charAt((this as string).length.random);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'lower', {
	get: function () {
		return (this as string).toLowerCase();
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'capitalize', {
	get: function () {
		return (this as string).at(0).toUpperCase() + (this as string).slice(1);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(String.prototype, 'uncapitalize', {
	get: function () {
		return (this as string).at(0).toLowerCase() + (this as string).slice(1);
	},
	enumerable: true,
	configurable: true,
});
// Array.prototype
Array.prototype.get = function (subString: string) {
	return this.filter((i: string) => i.includes(subString));
};
Object.defineProperty(Array.prototype, 'randomElement', {
	get: function () {
		return this[this.length.random];
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Array.prototype, 'lastElement', {
	get: function () {
		return this[this.length - 1];
	},
	enumerable: true,
	configurable: true,
});
// Number.prototype
Number.prototype.range = async function (input: () => Promise<any> | any) {
	await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
		await i;
		return input();
	}, Promise.resolve());
};
Object.defineProperty(Number.prototype, 'random', {
	get: function () {
		return Math.floor(Math.random() * (this as number));
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'alpha', {
	get: function () {
		if (!this) return '';
		return array(this)
			.map(() => alphaChars.randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
	get: function () {
		if (!this) return '';
		return array(this)
			.map(() => (alphaChars + numChars).randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'numeric', {
	get: function () {
		return array(this)
			.map(() => numChars.randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'floor', {
	get: function () {
		return Math.floor(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'round', {
	get: function () {
		return Math.round(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'abs', {
	get: function () {
		return Math.abs(this);
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'mb2b', {
	get: function () {
		return this * 1024 * 1024;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 's2ms', {
	get: function () {
		return this * 1000;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'm2s', {
	get: function () {
		return this * 60;
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'h2s', {
	get: function () {
		return this * (60).m2s;
	},
	enumerable: true,
	configurable: true,
});
