import * as fs from 'fs'
import * as path from 'path'
import { NodePath, Binding } from 'babel-traverse'
// @ts-ignore
import { createMacro, MacroError } from 'babel-plugin-macros'
// @ts-ignore
import pkg from '../package.json'
import * as t from 'babel-types'
import transform, { TransformConfig } from './transform'
import { defaultOptions } from '.'
import { ImageProps } from './types'

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
                root: string
            }
        }
    }
    babel: {
        types: typeof t
    }
    config: TransformConfig
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

const getFilePath = (path: NodePath): string => {
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

const objectToExpression = (object: object) =>
    Object.entries(object).map(([key, value]) =>
        t.objectProperty(t.stringLiteral(key), t.stringLiteral(value)),
    )

const dataUriMacro = ({ references, state, babel, config }: Options) => {
    const {
        file: {
            opts: { filename },
        },
    } = state
    const { types: t } = babel
    checkReferences(references)
    references.default.forEach(({ parentPath: dataUriCall }) => {
        checkCall(dataUriCall)
        const convertee: NodePath = (dataUriCall.get('arguments.0') as any) as NodePath
        const filePath = getFilePath(convertee)
        const filePathAbsolute = path.resolve(path.dirname(filename), filePath)
        const fileExists = fs.existsSync(filePathAbsolute)
        if (!fileExists) throw new MacroError(`media.macro could not resolve: ${filePath}`)
        const root = state.file.opts.root
        const mergedConfig = {
            ...defaultOptions,
            ...config,
        }
        const resultPath = transform(root, filePathAbsolute, mergedConfig)
        const mediaData: ImageProps = {
            imgSrc: resultPath,
            imgSrcSet: resultPath,
            imgWebPSrc: resultPath,
            imgWebPSrcSet: resultPath,
            imgBase64: resultPath,
        }
        dataUriCall.replaceWith(t.objectExpression(objectToExpression(mediaData)))
    })
}

const configName = 'media'

export default createMacro(dataUriMacro, { configName })
