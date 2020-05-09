const fs = require("fs");
const pkg = require("../package.json");

let copyright = `Copyright (c) ${pkg.author ? pkg.author.name || pkg.author : ""}`;
try {
  const licenseFile = fs.readFileSync(process.cwd() + "/LICENSE", { encoding: "utf8" });
  const result = licenseFile.match(/^copy.*$/img);

  if (result && result[0]) {
    copyright = result[0];
  }

} catch (e) { }
const defaultBanner = `/*
${copyright}
name: ${pkg.name}
license: ${pkg.license}
author: ${pkg.author ? pkg.author.name || pkg.author : ""}
repository: ${pkg.repository.url}
version: ${pkg.version}
*/`;
const commonjsPlugin = require("@rollup/plugin-commonjs")();
const typescriptPlugin = require("rollup-plugin-typescript2");
const resolvePlugin = require("@rollup/plugin-node-resolve")();

module.exports = function config(options) {
  if (Array.isArray(options)) {
    return options.map(options2 => config(options2)).reduce((prev, cur) => prev.concat(cur), []);
  }
  if (Array.isArray(options.output)) {
    return options.output.map(file => config({
      ...options,
      output: file,
    }));
  }
  const {
    input,
    output, // string | string[]
    tsconfig = "tsconfig.json",
    format = "umd", // "umd", "cjs", "es"
    exports = "default", // "default", "named"
    sourcemap = true, // boolean,
    plugins = [],
    name, // string,
    resolve, // boolean
    commonjs, // boolean,
    external, // {object}
    inputOptions, // other input options
    outputOptions, // other output options
    banner = defaultBanner,
  } = options;
  const nextPlugins = plugins.concat([
    typescriptPlugin({
      tsconfig,
      "sourceMap": true,
    })
  ]);

  commonjs && nextPlugins.push(commonjsPlugin);
  resolve && nextPlugins.push(resolvePlugin);

  return {
    input,
    plugins: nextPlugins,
    external: Object.keys(external || {}),
    ...inputOptions,
    output: {
      banner,
      format: "es",
      freeze: false,
      esModule: false,
      interop: false,
      globals: external,
      format,
      name,
      exports,
      file: output,
      sourcemap,
      ...outputOptions,
    },
  };
}
