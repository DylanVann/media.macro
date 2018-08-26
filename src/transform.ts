import crypto from 'crypto'
import path from 'path'
import fs from 'fs-extra'
import Big from 'big.js'

const baseEncodeTables = {
  26: 'abcdefghijklmnopqrstuvwxyz',
  32: '123456789abcdefghjkmnpqrstuvwxyz', // no 0lio
  36: '0123456789abcdefghijklmnopqrstuvwxyz',
  49: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', // no lIO
  52: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  58: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', // no 0lIO
  62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  64: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
}

type Base = keyof typeof baseEncodeTables
type HashName = 'sha1' | 'md5' | 'sha256' | 'sha512'
type DigestName = 'hex' | 'base26' | 'base32' | 'base36' | 'base49' | 'base52' | 'base58' | 'base62' | 'base64'

function encodeBufferToBase (buffer: Buffer, base: Base) {
  const encodeTable = baseEncodeTables[base]
  if (!encodeTable) throw new Error('Unknown encoding base' + base)

  const readLength = buffer.length

  Big.RM = Big.DP = 0
  let b = new Big(0)
  for (let i = readLength - 1; i >= 0; i--) {
    b = b.times(256).plus(buffer[i])
  }

  let output = ''
  while (b.gt(0)) {
    const key = b.mod(base) as any as number
    output = encodeTable[key] + output
    b = b.div(base)
  }

  Big.DP = 20
  Big.RM = 1

  return output
}

function hash (filePath: string, hashName: HashName, digestType: DigestName, maxLength: number) {
  hashName = hashName || 'md5'
  maxLength = maxLength || 128

  const contents = fs.readFileSync(filePath)
  const hasher = crypto.createHash(hashName).update(contents)

  const base =  digestType.substr(4) as any as Base
  if (
    digestType === 'base26' ||
    digestType === 'base32' ||
    digestType === 'base36' ||
    digestType === 'base49' ||
    digestType === 'base52' ||
    digestType === 'base58' ||
    digestType === 'base62' ||
    digestType === 'base64'
  ) {
    return encodeBufferToBase(hasher.digest(), base).substr(
      0,
      maxLength
    )
  } else {
    return hasher.digest(digestType || 'hex').substr(0, maxLength)
  }
}

interface Options {
    name: string
    outputPath: string
    publicPath: string
    context: string
}

export default (rootPath: string, filePath: string, opts: Options) => {
  let url = opts.name
  let ext = 'bin'
  let basename = 'file'
  let directory = ''
  let outputPath = opts.outputPath
  let publicPath = opts.publicPath.replace(/\/$/, '')
  let context = opts.context[0] == '/' ? opts.context.substr(1) : opts.context
  let contextPath = path.resolve(rootPath, context)

  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist')
  }

  const parsed = path.parse(filePath)

  if (parsed.ext) {
    ext = parsed.ext.substr(1)
  }

  let basePath

  if (parsed.dir) {
    basename = parsed.name
    basePath = parsed.dir + path.sep
  }

  directory = path
    .relative(contextPath, basePath + '_')
    .replace(/\\/g, '/')
    .replace(/\.\.(\/)?/g, '_$1')
  directory = directory.substr(0, directory.length - 1)

  url = url
    .replace(/\[ext\]/gi, () => ext)
    .replace(/\[name\]/gi, () => basename)
    .replace(/\[path\]/gi, () => directory)

  url = url.replace(
    /\[(?:([^:]+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
    (_: string, hashType: HashName, digestType: DigestName, maxLength: string) =>
      hash(filePath, hashType, digestType, parseInt(maxLength, 10))
  )

  fs.copySync(filePath, path.join(rootPath, outputPath, url.split('?')[0]))

  return publicPath + '/' + url
}
