#!/usr/bin/env node
import * as ts from "typescript";
import fs from 'fs';

function camelCase(str: string) {
    return str.substring(0, 1).toLowerCase() + str.substring(1);
}

function decoderNameFromTypeName(name: string) {
    return `${camelCase(name)}Decoder`;
}

function generateDecoderImport() {
    const decoderIdentifier = ts.factory.createIdentifier('decoders');
    const decoderNamedBindings = ts.factory.createNamespaceImport(decoderIdentifier);
    const decoderImportClause = ts.factory.createImportClause(false, undefined, decoderNamedBindings);
    const decoderModuleSpecifier = ts.factory.createStringLiteral('decoders');
    const decoderImportDeclaration = ts.factory.createImportDeclaration(undefined, undefined, decoderImportClause, decoderModuleSpecifier);
    return decoderImportDeclaration;
}

function generateDecoderCall(decoderName: string) {
    const importIdentifier = ts.factory.createIdentifier('decoders');
    const decoderIdentifier = ts.factory.createIdentifier(decoderName);
    const propertyAccess = ts.factory.createPropertyAccessExpression(importIdentifier, decoderIdentifier);
    return propertyAccess;
}

function generateDecoderFuncCall(decoderName: string, argumentsArray: readonly ts.Expression[] | undefined) {
    const propertyAccess = generateDecoderCall(decoderName);
    const callExpression = ts.factory.createCallExpression(propertyAccess, undefined, argumentsArray);
    return callExpression;
}

function decoderFromType(type?: ts.TypeNode): ts.Expression | undefined {
    switch (type?.kind) {
        case ts.SyntaxKind.StringKeyword:
            return generateDecoderCall('string');

        case ts.SyntaxKind.NumberKeyword:
            return generateDecoderCall('number');

        case ts.SyntaxKind.BooleanKeyword:
            return generateDecoderCall('boolean');

        case ts.SyntaxKind.ObjectKeyword:
            return generateDecoderCall('jsonObject');
        case ts.SyntaxKind.UnionType:
            const unionType = type as ts.UnionTypeNode;
            const subtypes: ts.Expression[] = unionType.types.map(x => decoderFromType(x)).filter(x => !!x) as ts.Expression[];
            return generateDecoderFuncCall('either', subtypes);
        case ts.SyntaxKind.ArrayType:
            const arrayType = decoderFromType((type as ts.ArrayTypeNode).elementType);
            if (!arrayType) {
                return undefined;
            }
            return generateDecoderFuncCall('array', [arrayType]);
        case ts.SyntaxKind.TupleType:
            const tupleType = type as ts.TupleTypeNode;
            const elements = tupleType.elements.map(x => decoderFromType(x)).map(x => x ?? generateDecoderCall('json')) as ts.Expression[];
            return generateDecoderFuncCall('tuple', elements);
            return undefined;
        case ts.SyntaxKind.LiteralType:
            const literal = (type as ts.LiteralTypeNode).literal;
            let arg = undefined;
            switch (literal.kind) {
                case ts.SyntaxKind.StringLiteral:
                    arg = ts.factory.createStringLiteral(literal.text);
                    break;
                case ts.SyntaxKind.NumericLiteral:
                    arg = ts.factory.createNumericLiteral(literal.text);
            }
            if (!arg) {
                return undefined;
            }
            return generateDecoderFuncCall('constant', [arg]);

        case ts.SyntaxKind.TypeReference:
            const typename = (type as ts.TypeReferenceNode).typeName.getText();
            return ts.factory.createIdentifier(decoderNameFromTypeName(typename));

        case ts.SyntaxKind.TypeLiteral:
            const typeLiteralNode = type as ts.TypeLiteralNode;
            const propSigs = typeLiteralNode.members.map(x => x.kind === ts.SyntaxKind.PropertySignature ? x as ts.PropertySignature : undefined).filter(x => !!x) as ts.PropertySignature[];

            const objectLiteralExpr = ts.factory.createObjectLiteralExpression(propSigs.map(x => {
                let prop = decoderFromType(x.type!);

                if (!prop) {
                    return;
                }
                if (x.questionToken) {
                    prop = generateDecoderFuncCall('optional', [prop]);
                }
                return ts.factory.createPropertyAssignment(x.name, prop);
            }).filter(x => !!x) as ts.ObjectLiteralElementLike[], true
            );
            return generateDecoderFuncCall('object', [objectLiteralExpr]);
        default:
            return undefined;
    }
}


function generateDecoder(decl: ts.TypeAliasDeclaration) {
    const decoderName = ts.factory.createIdentifier(decoderNameFromTypeName(decl.name.escapedText.toString()));

    const objectDecoderCall = decoderFromType(decl.type);

    const decoderDeclaration = ts.factory.createVariableDeclaration(decoderName, undefined, undefined, objectDecoderCall);
    const decoderDeclarationList = ts.factory.createVariableDeclarationList([decoderDeclaration], ts.NodeFlags.Const);
    const statement = ts.factory.createVariableStatement(undefined, decoderDeclarationList);

    return statement;
}

export function generate(sourceFile: ts.SourceFile) {
    const generatedAstNodes: (ts.Node | undefined)[] = [];
    generatedAstNodes.push(generateDecoderImport());
    generatedAstNodes.push(undefined);
    ts.forEachChild(sourceFile, processNode);


    function processNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.TypeAliasDeclaration:
                const decoder = generateDecoder(node as ts.TypeAliasDeclaration);
                generatedAstNodes.push(decoder);
                generatedAstNodes.push(undefined);
                break;
        }
    }

    const resultFile = ts.createSourceFile("output.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, omitTrailingSemicolon: false });
    generatedAstNodes.forEach(node => {
        if (node) {
            process.stdout.write(printer.printNode(ts.EmitHint.Unspecified, node, resultFile));
        } else {
            process.stdout.write('\n\n');
        }
    });

}


if (require.main === module) {
    var sourceString = fs.readFileSync(0, 'utf-8');
    const sourceFile = ts.createSourceFile(
        'input.ts',
        sourceString,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );
    generate(sourceFile);
}
