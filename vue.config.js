"use strict";
const path = require("path");
const defaultSettings = require("./src/settings.js");
const { defineConfig } = require("@vue/cli-service");

function resolve(dir) {
    return path.join(__dirname, dir);
}

const name = defaultSettings.title || "vue Admin Template"; // page title

const port = process.env.port || process.env.npm_config_port || 9527; // dev port
const useSourceMap = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = defineConfig({
    publicPath: "./",
    outputDir: "dist",
    assetsDir: "static",
    lintOnSave: useSourceMap,
    lintOnSave: false,
    productionSourceMap: false,
    devServer: {
        port: port,
        allowedHosts: ["oxpecker.netease.com"],
        client: {
            overlay: true,
        },
    },
    pages: {
        index: {
            // page 的入口
            entry: "src/main.js",
            // 模板来源
            template: "public/index.html",
            // 在 dist/index.html 的输出
            filename: "index.html",

            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: name,
            chunks: ["chunk-vendors", "chunk-common", "index"],
        },
        startDebug: {
            // page 的入口
            entry: "src/pages/start-debug/main.js",
            // 模板来源
            template: "public/mobile.html",
            // 在 dist/index.html 的输出
            filename: "start-debug.html",
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: "打开APP",
            chunks: ["chunk-vendors", "chunk-common", "startDebug"],
        },
    },
    configureWebpack: {
        cache: {
            type: "filesystem",
        },
        resolve: {
            alias: {
                "@": resolve("src"),
            },
            fallback: {
                path: require.resolve("path-browserify"),
                net: false,
            },
        },
    },
    chainWebpack(config) {
        config.plugins.delete("preload"); // TODO: need test
        config.plugins.delete("prefetch"); // TODO: need test

        // set preserveWhitespace
        config.module
            .rule("vue")
            .use("vue-loader")
            .loader("vue-loader")
            .tap(options => {
                options.compilerOptions.preserveWhitespace = true;
                return options;
            })
            .end();

        config.when(useSourceMap, config => config.devtool("eval-source-map"));
    },
});
