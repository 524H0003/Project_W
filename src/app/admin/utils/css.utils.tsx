export const getDataCss = (...args: (string | number)[]) => args.join('-'),
	getResourceElementCss = (resourceId: string, suffix: string) =>
		getDataCss(resourceId, suffix),
	getActionElementCss = (
		resourceId: string,
		actionName: string,
		suffix: string,
	) => getDataCss(resourceId, actionName, suffix);
