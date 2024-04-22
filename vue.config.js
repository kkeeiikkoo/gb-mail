const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
  },
  publicPath: process.env.NODE_ENV === "production" ? "/test/gb-mail/" : "/",
});
