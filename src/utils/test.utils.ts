// ? The spy function ment to initiate functions need to be hooked
export const spy = <T extends Record<string, any>>(
	arr: { obj: T; key: (keyof T)[] }[],
) =>
	arr.forEach(({ obj, key }) =>
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		key.forEach((k) => jest.spyOn(obj, k.toString())),
	);

interface Expectation<T, K extends keyof jest.Matchers<T>> {
	type: K;
	params: Parameters<jest.Matchers<T>[K]>;
	not?: boolean;
	debug?: boolean;
}

/**
 * A function run async functions and catch both throw errors and results
 * @param {T} func - the function to test
 * @param {Parameters<T>} params - the params for the function to test
 * @param {boolean} throwError - is the function going to throw errors?
 * @param {number} numOfRun - how many time function will run and the last one is going to test
 * @param {Expectation<T, K>[]} exps - expectations that function will return
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
		await (exp.not ? result.not : result)[exp.type].apply(null, exp.params);
	}
	await onFinish();
}
