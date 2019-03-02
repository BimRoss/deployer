process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: [{
          provider: "github",
          owner: "BimRoss",
          repo: "releaser-3dmm"
        }],
        productName: "Releaser",
        nsis: {
          artifactName: "releaser-3dmm-setup.${ext}",
          uninstallDisplayName: "Releaser"
        }
      }
    }
  },
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/styles/main.sass";`
      }
    }
  }
}
