const path = require("path");
const htmlWebpackPlugin = require('html-webpack-plugin');
const config = {
  mode: "production",
  entry: [path.resolve(__dirname, "./index.ts")],
  output: {
    filename: "js/bundle.js",
    path: path.resolve(__dirname, "../../dist/public")
  },
  module: {
    rules: [
      {
        test: /\.ts|\.tsx$/,
        use: ["ts-loader"]
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(jpg|png|gif)$/,
        type: "asset/inline",
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".scss", "css", ".svg"],
    moduleExtensions: ["node_modules"]
  },
  resolve: {
    symlinks: false,
    extensions: [".ts", ".js", ".scss", "css", ".svg"],
  },
};
config.devtool = "source-map";
module.exports = config;
