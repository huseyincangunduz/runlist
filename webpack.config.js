const path = require("path");
// const nodeExternals = require("webpack-node-externals");

module.exports = {
  devtool: "source-map",
  mode: "development",
  entry: "./src/index.ts",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  // externals: [nodeExternals({ modulesDir: "./nwmodule/node_modules" })],
  output: {
    path: path.resolve(__dirname),
    filename: "index.js",
  },

  target: "node",
};
