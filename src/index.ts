import { dirname, extname, resolve } from 'path'
import transform from './transform'

interface Options {
    name: string
    outputPath: string
    publicPath: string
    context: string
    extensions: string[]
}

export const defaultOptions: Options = {
  name: '[hash].[ext]',
  outputPath: '/public',
  publicPath: '/public',
  context: '',
  extensions: ['gif', 'jpeg', 'jpg', 'png', 'svg']
}

interface Variable {
   node: {
     specifiers?: Array<{ local: { name: string }}>
   }
}

const getVariableName = (p: Variable) => {
  if (p.node.specifiers && p.node.specifiers[0] && p.node.specifiers[0].local) {
    return p.node.specifiers[0].local.name
  }
}

interface State {
    opts: Options
    file: {
        opts: {
            filename: string
            sourceRoot?: string
        }
    }
}

const applyTransform = (p: any, t: any, state: State, value: string, calleeName: string) => {
  const ext = extname(value)
  const options = Object.assign({}, defaultOptions, state.opts)

  if (options.extensions && options.extensions.indexOf(ext.slice(1)) >= 0) {
    try {
      const rootPath = state.file.opts.sourceRoot || process.cwd()
      const scriptDirectory = dirname(resolve(state.file.opts.filename))
      const filePath = resolve(scriptDirectory, value)

      const uri = transform(rootPath, filePath, options)

      if (calleeName === 'require') {
        p.replaceWith(t.StringLiteral(uri))
        return
      }

      const variableName = getVariableName(p)

      if (!variableName) {
        throw new Error('Cannot determine variable name to assign to')
      }

      p.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier(variableName), t.stringLiteral(uri))
        ])
      )
    } catch (e) {
      throw p.buildCodeFrameError(e.message)
    }
  }
}

export function transformImportsInline ({ types: t }: { types: any}) {
  return {
    visitor: {
      ImportDeclaration (p: any, state: State) {
        applyTransform(p, t, state, p.node.source.value, 'import')
      },
      CallExpression (p: any, state: State) {
        const callee = p.get('callee')
        if (!callee.isIdentifier() || !callee.equals('name', 'require')) {
          return
        }

        const arg = p.get('arguments')[0]
        if (!arg || !arg.isStringLiteral()) {
          return
        }

        applyTransform(p, t, state, arg.node.value, 'require')
      }
    }
  }
}

export default transformImportsInline
