// Interfaces
/**
 * Test's expectations
 */
interface Expectation<T, K extends keyof jest.Matchers<T>> {
	/**
	 * Expectation's type
	 */
	type: K;

	/**
	 * Expectation's param
	 */
	params: Parameters<jest.Matchers<T>[K]>;

	/**
	 * Is not?
	 */
	not?: boolean;

	/**
	 * Is debugging?
	 */
	debug?: boolean;
}

/**
 * A function run async functions and catch both throw errors and results
 * @param {T} func - the function to test
 * @param {object} options - the options to execute
 */
export async function execute<
	T extends (...args: any[]) => Promise<any>,
	K extends keyof jest.Matchers<T>,
>(
	func: T,
	options: {
		throwError?: boolean;
		numOfRun?: number;
		exps: Expectation<T, K>[];
		onFinish?: (result: any) => void;
	},
) {
	let funcResult: any;
	const { throwError = false, numOfRun = 1, exps, onFinish = null } = options;

	if (!throwError && numOfRun - 1) await numOfRun.ra(func);

	const result = throwError
		? expect(await func()).rejects
		: expect((funcResult = await func()));
	if (exps.some((i) => i.debug)) console.log(funcResult);
	for (const exp of exps) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		await (exp.not ? result.not : result)[exp.type].apply(null, exp.params);
	}
	if (onFinish) await onFinish(await func());
}
