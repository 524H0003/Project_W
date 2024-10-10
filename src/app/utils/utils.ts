export class InterfaceCasting<T, K extends keyof T> {
	[key: string]: any;

	constructor(input: T, get: readonly K[]) {
		get.forEach((_) => (this[String(_)] = input[_]));
	}

	static quick<T, K extends keyof T>(input: T, get: readonly K[]): T {
		return new InterfaceCasting(input, get) as T;
	}
}

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
	matching = <T>(input: T[], required: T[]): boolean =>
		required.every((i) => input.some((j) => i === j));

// Types
type MethodDecorator = (
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor;

type MethodPrerun = (target: any, propertyKey: Function, args: any) => void;
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
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numChars = '0123456789';

declare global {
	interface Array<T> {
		readonly randomElement: T;
		get(subString: string): Array<T>;
		readonly lastElement: T;
	}
	interface Number {
		// number
		readonly floor: number;
		readonly round: number;
		readonly abs: number;

		// string
		readonly alpha: string;
		readonly numeric: string;
		readonly string: string;

		// file size
		readonly mb: number;

		// utils
		readonly random: number;
		ra(input: () => Promise<any>): Promise<void>; // range() # like Python's range()
	}
	interface String {
		readonly randomChar: string;
	}

	/**
	 * Return the formatted name of current file
	 * @param {string} file - the current file's name (must be __filename)
	 * @param {number} cut - How many chunk should get (default: 2)
	 * @return {string} formatted file's name
	 */
	function curFile(file: string, cut?: number): string;
	/**
	 * Return an array with length
	 * @param {number} length - the length of the array
	 * @param {any} initValue - the initial value for each element in array
	 * @return {any[]} the output array with length
	 */
	function array(length: number, initValue?: any): any[];
}

// Global functions
global.curFile = (file: string, cut = 2) =>
	file
		.split(/\/|\\/)
		.lastElement.split('.')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.slice(0, cut)
		.join('');
global.array = (length: number, initValue: any = '') =>
	Array(length)
		.join()
		.split(',')
		.map(() => initValue);
// String.prototype
Object.defineProperty(String.prototype, 'randomChar', {
	get: function () {
		return (this as string).charAt((this as string).length.random);
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
Number.prototype.ra = async function (input: () => Promise<any>) {
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
		return array(this)
			.map(() => alphaChars.randomChar)
			.join('');
	},
	enumerable: true,
	configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
	get: function () {
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
Object.defineProperty(Number.prototype, 'mb', {
	get: function () {
		return this * 1024 * 1024;
	},
	enumerable: true,
	configurable: true,
});
