const { injectBabelPlugin } = require('react-app-rewired')

const options = {
    publicPath: 'static',
    outputPath: 'public/static',
}

module.exports = (config, env) => {
    config = injectBabelPlugin('babel-plugin-macros', config)
    config = injectBabelPlugin(['media.macro', options], config)
    return config
}
