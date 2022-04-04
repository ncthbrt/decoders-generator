#!/usr/bin/env node
import * as ts from "typescript";
import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import * as decoders from 'decoders';
import type { Decoder } from 'decoders';


const argv = yargs(hideBin(process.argv)).argv;
const argsDecoder: Decoder<DecoderProps> = decoders.object({
    tag: decoders.maybe(decoders.string),
    namespacedImport: decoders.maybe(decoders.boolean)
});
const decodedArgs = argsDecoder.verify(argv);

function camelCase(str: string) {
    return str.substring(0, 1).toLowerCase() + str.substring(1);
}

function decoderNameFromTypeName(name: string) {
    return `${camelCase(name)}Decoder`;
}

function generateDecoderImport(props: DecoderProps, imports: { [key: string]: boolean }) {
    const decoderIdentifier = ts.factory.createIdentifier('decoders');
    const decoderModuleSpecifier = ts.factory.createStringLiteral('decoders');
    let decoderImportClause;
    if (props.namespacedImport) {
        const decoderNamespaceImport = ts.factory.createNamespaceImport(decoderIdentifier);
        decoderImportClause = ts.factory.createImportClause(false, undefined, decoderNamespaceImport);
    } else {
        const importSpecifiers = Object.keys(imports).map((key) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(key)));
        const decoderNamedBindings = ts.factory.createNamedImports(importSpecifiers);
        decoderImportClause = ts.factory.createImportClause(false, undefined, decoderNamedBindings);
    }
    const decoderImportDeclaration = ts.factory.createImportDeclaration(undefined, undefined, decoderImportClause, decoderModuleSpecifier);
    return decoderImportDeclaration;
}

function generateDecoderTypeImport() {
    const decoderIdentifier = ts.factory.createIdentifier('decoders');
    const importSpecifier = ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Decoder'));
    const decoderNamedBindings = ts.factory.createNamedImports([importSpecifier]);
    const decoderImportClause = ts.factory.createImportClause(true, undefined, decoderNamedBindings);
    const decoderModuleSpecifier = ts.factory.createStringLiteral('decoders');
    const decoderImportDeclaration = ts.factory.createImportDeclaration(undefined, undefined, decoderImportClause, decoderModuleSpecifier);
    return decoderImportDeclaration;
}

function generateDecoderCall(decoderName: string, props: DecoderProps, imports: { [key: string]: boolean }) {
    const importIdentifier = ts.factory.createIdentifier('decoders');
    const decoderIdentifier = ts.factory.createIdentifier(decoderName);
    imports[decoderName] = true;
    if (props.namespacedImport) {
        const propertyAccess = ts.factory.createPropertyAccessExpression(importIdentifier, decoderIdentifier);
        return propertyAccess;
    } else {
        return decoderIdentifier;
    }
}

function generateDecoderFuncCall(decoderName: string, argumentsArray: readonly ts.Expression[] | undefined, props: DecoderProps, imports: { [key: string]: boolean }) {
    const propertyAccess = generateDecoderCall(decoderName, props, imports);
    const callExpression = ts.factory.createCallExpression(propertyAccess, undefined, argumentsArray);
    return callExpression;
}

function decoderFromUnionType(unionType: ts.UnionTypeNode, props: DecoderProps, imports: { [key: string]: boolean }) {
    if (props.tag) {
        if (unionType.types.every(subtype => {
            if (subtype.kind === ts.SyntaxKind.TypeLiteral) {
                const literalNode = (subtype as ts.TypeLiteralNode);
                return literalNode.members.some(member => {
                    if (member.kind !== ts.SyntaxKind.PropertySignature) {
                        return false;
                    }
                    if (member.name?.getText() !== props.tag) {
                        return false;
                    }

                    const propSig = member as ts.PropertySignature;
                    if (propSig.type?.kind !== ts.SyntaxKind.LiteralType) {
                        return false;
                    }
                    const literal = propSig.type as ts.LiteralTypeNode;
                    return literal.literal.kind === ts.SyntaxKind.StringLiteral;
                })
            }
            return false;

        })) {

            // is a tagged type literal;
            return generateDecoderFuncCall('taggedUnion',
                [
                    ts.factory.createStringLiteral(props.tag),
                    ts.factory.createObjectLiteralExpression(
                        unionType.types
                            .map(x => x as ts.TypeLiteralNode)
                            .map(subtype => {
                                let prop = decoderFromType(subtype, props, imports);

                                if (!prop) {
                                    return;
                                }
                                const tag = subtype.members.find(x => x.name?.getText() === props.tag);
                                const propSig = tag as ts.PropertySignature;
                                const literalNode = propSig.type as ts.LiteralTypeNode;
                                const stringLiteral = literalNode.literal as ts.StringLiteral;
                                return ts.factory.createPropertyAssignment(ts.factory.createIdentifier(stringLiteral.getText()), prop);
                            }).filter(x => !!x) as ts.ObjectLiteralElementLike[],
                        true
                    )
                ], props, imports
            );
        }
    }
    const subtypes: ts.Expression[] = unionType.types.map(x => decoderFromType(x, props, imports)).filter(x => !!x) as ts.Expression[];
    return generateDecoderFuncCall('either', subtypes, props, imports);
}

type DecoderProps = { tag?: string | null, namespacedImport?: boolean | null };

function decoderFromType(type: ts.TypeNode, props: DecoderProps, imports: { [key: string]: boolean }): ts.Expression | undefined {
    switch (type?.kind) {
        case ts.SyntaxKind.StringKeyword:
            return generateDecoderCall('string', props, imports);

        case ts.SyntaxKind.NumberKeyword:
            return generateDecoderCall('number', props, imports);

        case ts.SyntaxKind.BooleanKeyword:
            return generateDecoderCall('boolean', props, imports);

        case ts.SyntaxKind.ObjectKeyword:
            return generateDecoderCall('jsonObject', props, imports);
        case ts.SyntaxKind.UnionType:
            return decoderFromUnionType(type as ts.UnionTypeNode, props, imports);
        case ts.SyntaxKind.ArrayType:
            const arrayType = decoderFromType((type as ts.ArrayTypeNode).elementType, props, imports);
            if (!arrayType) {
                return undefined;
            }
            return generateDecoderFuncCall('array', [arrayType], props, imports);
        case ts.SyntaxKind.TupleType:
            const tupleType = type as ts.TupleTypeNode;
            const elements = tupleType.elements.map(x => decoderFromType(x, props, imports)).map(x => x ?? generateDecoderCall('json', props, imports)) as ts.Expression[];
            return generateDecoderFuncCall('tuple', elements, props, imports);
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
            return generateDecoderFuncCall('constant', [arg], props, imports);

        case ts.SyntaxKind.TypeReference:
            const typename = (type as ts.TypeReferenceNode).typeName.getText();
            return ts.factory.createIdentifier(decoderNameFromTypeName(typename));

        case ts.SyntaxKind.TypeLiteral:
            const typeLiteralNode = type as ts.TypeLiteralNode;
            const propSigs = typeLiteralNode.members.map(x => x.kind === ts.SyntaxKind.PropertySignature ? x as ts.PropertySignature : undefined).filter(x => !!x) as ts.PropertySignature[];

            const objectLiteralExpr = ts.factory.createObjectLiteralExpression(propSigs.map(x => {
                let prop = decoderFromType(x.type!, props, imports);

                if (!prop) {
                    return;
                }
                if (x.questionToken) {
                    prop = generateDecoderFuncCall('optional', [prop], props, imports);
                }
                return ts.factory.createPropertyAssignment(x.name, prop);
            }).filter(x => !!x) as ts.ObjectLiteralElementLike[], true
            );
            return generateDecoderFuncCall('object', [objectLiteralExpr], props, imports);
        default:
            return undefined;
    }
}


function generateDecoder(decl: ts.TypeAliasDeclaration, props: DecoderProps, imports: { [key: string]: boolean }) {
    const typeName = decl.name.escapedText.toString();
    const decoderName = ts.factory.createIdentifier(decoderNameFromTypeName(typeName));


    const objectDecoderCall = decoderFromType(decl.type, props, imports);

    const typeDeclaration = ts.factory.createTypeReferenceNode(typeName, []);
    const decoderTypeDeclaration = ts.factory.createTypeReferenceNode('Decoder', [typeDeclaration]);

    const decoderDeclaration = ts.factory.createVariableDeclaration(decoderName, undefined, decoderTypeDeclaration, objectDecoderCall);


    const decoderDeclarationList = ts.factory.createVariableDeclarationList([decoderDeclaration], ts.NodeFlags.Const);
    const statement = ts.factory.createVariableStatement(undefined, decoderDeclarationList);

    return statement;
}

export function generate(sourceFile: ts.SourceFile, props: DecoderProps) {
    const generatedAstNodes: (ts.Node | undefined)[] = [];
    const imports: { [key: string]: boolean } = {};
    ts.forEachChild(sourceFile, processNode);
    generatedAstNodes.unshift(undefined);
    generatedAstNodes.unshift(generateDecoderImport(props, imports));
    generatedAstNodes.unshift(generateDecoderTypeImport());


    function processNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.TypeAliasDeclaration:
                const decoder = generateDecoder(node as ts.TypeAliasDeclaration, props, imports);
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
            process.stdout.write('\n');
        } else {
            process.stdout.write('\n');
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
    generate(sourceFile, { ...decodedArgs, tag: decodedArgs.tag ?? undefined });
}
