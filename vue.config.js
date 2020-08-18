const path = require('path');

module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'LCO Observation Portal'
        return args
      })
  },
  configureWebpack: config => {
    return {
      resolve: {
        alias: {
          // This is needed for jquery-file-download/src/Scripts/jquery.fileDownload.js to work
          'jquery': path.join(__dirname, 'node_modules/jquery/src/jquery'),
        }
      }
    };
  }

}
