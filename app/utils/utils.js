/**
 * Casting object to interface
 */
export class InterfaceCasting {
    /**
     * Convert object to interface
     * @param {T} input - the input object
     * @param {K[]} get - the interface's properties
     */
    constructor(input, get) {
        get.forEach((_) => {
            if (typeof input[_] != 'undefined')
                this[String(_)] = input[_];
        });
    }
    /**
     * Quick method to convert object to interface
     * @param {T} input - the input object
     * @param {K[]} get - the interface's properties
     * @return {InterfaceCasting} the result of casting
     */
    static quick(input, get) {
        return new InterfaceCasting(input, get);
    }
    /**
     * Quick method to convert object to interface
     * @param {T} input - the input object
     * @param {K[]} get - the interface's properties
     * @return {InterfaceCasting} the result of casting
     */
    static delete(input, get) {
        get.forEach((_) => delete input[_]);
        return input;
    }
}
/**
 * @ignore
 */
export const logMethodCall = methodDecorator({
    prerun: (target, propertyKey, args) => {
        console.log(`Calling ${target.constructor.name}.${propertyKey.name} with arguments:`, args);
    },
    postrun: (target, propertyKey, result) => {
        console.log(`Result of ${target.constructor.name}.${propertyKey.name}:`, result);
    },
}), matching = (input, required) => required.some((i) => i === input);
// Decorators
/**
 * A class decorator that get all functions in class and implement them a function declared in argument
 * @param {MethodDecorator} decorator - the function will implement to all functions in class
 */
export function allImplement(decorator) {
    return function (target) {
        for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
            if (typeof target.prototype[propertyName] === 'function') {
                const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
                Object.defineProperty(target.prototype, propertyName, decorator(target, propertyName, descriptor));
            }
        }
    };
}
/**
 * A function decorator that implements prerun and postrun functions
 * @param {Object} functions - A two-element array that contains prerun and postrun functions
 */
export function methodDecorator(functions) {
    const { prerun = () => 0, postrun = () => 0 } = functions || {};
    return (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
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
const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', numChars = '0123456789';
// Global functions
try {
    global.curFile = (file, cut = 2) => file
        .split(/\/|\\/)
        .lastElement.split('.')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .slice(0, cut)
        .join('') +
        '_' +
        (5).string;
    global.array = (length, initValue = '') => Array(length)
        .join()
        .split(',')
        .map(() => initValue);
    global.delay = async (ms) => {
        await new Promise((resolve) => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
    };
}
catch { }
// String.prototype
Object.defineProperty(String.prototype, 'randomChar', {
    get: function () {
        return this.charAt(this.length.random);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(String.prototype, 'lower', {
    get: function () {
        return this.toLowerCase();
    },
    enumerable: true,
    configurable: true,
});
// Array.prototype
Array.prototype.get = function (subString) {
    return this.filter((i) => i.includes(subString));
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
Number.prototype.ra = async function (input) {
    await Array.from({ length: Number(this) }, (_, i) => i).reduce(async (i) => {
        await i;
        return input();
    }, Promise.resolve());
};
Object.defineProperty(Number.prototype, 'random', {
    get: function () {
        return Math.floor(Math.random() * this);
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'alpha', {
    get: function () {
        if (!this)
            return '';
        return array(this)
            .map(() => alphaChars.randomChar)
            .join('');
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Number.prototype, 'string', {
    get: function () {
        if (!this)
            return '';
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
