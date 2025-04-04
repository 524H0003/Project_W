import {
	InterfaceDeclaration,
	Project,
	ts,
	VariableDeclarationKind,
} from 'ts-morph';

const IKeysProj = new Project(),
	IKeysFiles = IKeysProj.addSourceFilesFromTsConfig('tsconfig.json'),
	IKeysOut = IKeysProj.createSourceFile('./src/build/models.ts', '', {
		overwrite: true,
	}),
	IKeysInterfaces = [];
function createKeys(node: InterfaceDeclaration) {
	function getInterface(node: any): string[] {
		if (node.getKind() !== ts.SyntaxKind.InterfaceDeclaration) return [];

		const extendedTypes = node
				.getExtends()
				.map((expr) =>
					IKeysInterfaces.find(
						(i) => i.getName() === expr.getExpression().getText(),
					),
				),
			extendedInterfaces: string[] = node
				.getProperties()
				.map((i) => i.getName());

		for (const extendedType of extendedTypes)
			if (extendedType) extendedInterfaces.push(...getInterface(extendedType));

		return extendedInterfaces.filter(
			(item, index) => extendedInterfaces.indexOf(item) === index,
		);
	}

	const allKeys = getInterface(node).sort((a, b) => a.localeCompare(b));
	IKeysOut.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: `${node.getName()}Keys`,
				initializer: (writer) =>
					writer.write(`${JSON.stringify(allKeys)} as const`),
			},
		],
	});
}
for (const file of IKeysFiles) {
	if (/(build.ts|types.ts|models.ts)/.test(file.getBaseName())) continue;
	IKeysInterfaces.push(...file.getInterfaces());
}
for (const file of IKeysFiles) {
	if (/(build.ts|types.ts|models.ts)/.test(file.getBaseName())) continue;

	for (const intfce of file.getInterfaces()) createKeys(intfce);
}
IKeysOut.saveSync();

const modelsProject = new Project(),
	modelsFiles = modelsProject.addSourceFilesAtPaths([
		'src/**/*.model.ts',
		'src/build/models.ts',
		'src/app/utils/utils.ts',
	]),
	modelsOut = modelsProject.createSourceFile('./src/build/types.ts', '', {
		overwrite: true,
	});
for (const file of modelsFiles) {
	modelsOut.addExportDeclaration({
		moduleSpecifier: `../${file.getFilePath().split('src')[1].slice(1, -3)}.js`,
	});
}
modelsOut.saveSync();
