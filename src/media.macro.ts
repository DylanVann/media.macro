import * as path from 'path'
import { NodePath, Binding } from 'babel-traverse'
// @ts-ignore
import { createMacro, MacroError } from 'babel-plugin-macros'
// @ts-ignore
import pkg from '../package.json'

const getDataUri = (filePath: string) => {
    return `mock`
}

interface Node {
    parentPath: NodePath
}

interface References {
    default: Node[]
}

interface Options {
    references: References
    state: {
        file: {
            opts: {
                filename: string
            }
        }
    }
    babel: {
        types: {
            stringLiteral: (node: any) => any
        }
    }
}

const checkReferences = (references: References) => {
    const usedReferences = Object.keys(references)
    if (usedReferences.length > 1 || usedReferences[0] !== 'default') {
        throw new MacroError(
            `${
                pkg.name
            } must be used as default import, instead you have used it as: ${usedReferences.join(
                ', ',
            )}.`,
        )
    }
}

const checkCall = (path: NodePath) => {
    if (!path.isCallExpression()) {
        throw new MacroError(
            `${pkg.name} should be used as function call, instead you have used it as part of ${
                path.node.type
            }.`,
        )
    }
}

const checkIsDefault = (path: NodePath) => {
    if (!path.isImportDefaultSpecifier()) {
        throw new MacroError(
            `${pkg.name} can convert only default imports, instead you have wanted to convert ${
                path.node.type
            }.`,
        )
    }
}

const getFilePath = (path: NodePath) => {
    if (path.isStringLiteral()) {
        return (path.node.value as any) as string
    } else if (path.isIdentifier()) {
        const node: string = (((path.get('name') as any) as NodePath).node as any) as string
        const binding: Binding = (path.scope.getBinding(node) as any) as Binding
        const converteePath = binding.path
        checkIsDefault(converteePath)
        const converteeImportDeclaration = converteePath.parentPath
        const nodePath = (converteeImportDeclaration.get('source.value') as any) as NodePath
        return (nodePath.node as any) as string
    } else {
        throw new MacroError(`${pkg.name} is used incorrectly.`)
    }
}

const dataUriMacro = ({
    references,
    state: {
        file: {
            opts: { filename },
        },
    },
    babel: { types },
}: Options) => {
    checkReferences(references)
    references.default.forEach(({ parentPath: dataUriCall }) => {
        checkCall(dataUriCall)
        const convertee: NodePath = (dataUriCall.get('arguments.0') as any) as NodePath
        const filePath = getFilePath(convertee)
        const requestedFile = path.resolve(path.dirname(filename), filePath)
        dataUriCall.replaceWith(types.stringLiteral(getDataUri(requestedFile)))
    })
}

export default createMacro(dataUriMacro)
