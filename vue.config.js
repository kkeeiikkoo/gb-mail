const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
  },
  devServer: {
    proxy: {
      "/api": {
        target: "https://www.businessnlp.jp/",
        changeOrigin: true,
        pathRewrite: { "^/api": "" }, // Assuming the server does not need /api
        secure: false, // If you are not using https
      },
    },
  },
  publicPath: process.env.NODE_ENV === "production" ? "/gb-mail/" : "/",
});
