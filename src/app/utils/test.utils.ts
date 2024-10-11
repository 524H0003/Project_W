// Interfaces
interface Expectation<T, K extends keyof jest.Matchers<T>> {
	type: K;
	params: Parameters<jest.Matchers<T>[K]>;
	not?: boolean;
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
		params?: Parameters<T>;
		throwError?: boolean;
		numOfRun?: number;
		exps: Expectation<T, K>[];
		onFinish?: Function;
	},
) {
	let funcResult: any;
	const {
			params,
			throwError = false,
			numOfRun = 1,
			exps,
			onFinish = () => {},
		} = options || {},
		chamber = () => (params ? func(...params) : func());

	if (!throwError && numOfRun - 1) await numOfRun.ra(chamber);

	const result = throwError
		? expect(func).rejects
		: expect((funcResult = await chamber()));
	if (exps.some((i) => i.debug)) console.log(funcResult);
	for (const exp of exps) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		await (exp.not ? result.not : result)[exp.type].apply(null, exp.params);
	}
	await onFinish();
}
