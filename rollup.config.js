const buildHelper = require("./config/build-helper");
const glslify = require("rollup-plugin-glslify");

export default buildHelper([
  {
    name: "App",
    input: "./src/App.ts",
    output: `./web/dist/app.js`,
    format: "umd",
    resolve: true,
    plugins: [
			glslify(),
    ]
  }
]);
