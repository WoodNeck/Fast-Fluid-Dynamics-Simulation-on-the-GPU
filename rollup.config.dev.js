const buildHelper = require("./config/build-helper");
const glslify = require("rollup-plugin-glslify");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");

const plugins = [
	glslify(),
  serve({
		open: true,
		contentBase: "web",
	}),
  livereload("web")
];

export default buildHelper([
  {
    name: "App",
    input: "./src/App.ts",
    output: `./web/dist/app.js`,
    format: "umd",
    resolve: true,
    plugins,
  }
]);
