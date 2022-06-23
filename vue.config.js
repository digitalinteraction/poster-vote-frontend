process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  lintOnSave: true,
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        // indentedSyntax: true,
        additionalData: '@import "~@/assets/sass/shared"\n',
      },
    },
  },
  chainWebpack: () => {
    // const svgRule = config.module.rule('svg')
    // svgRule.uses.clear()
    // svgRule.use('vue-svg-loader').loader('vue-svg-loader')
  },
}
