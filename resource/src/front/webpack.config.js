const path = require("path");
const glob = require("glob");
const TerserPlugin = require("terser-webpack-plugin");
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
        test: /\.(jpg|png|svg|gif)$/,
        loaders: "url-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".scss", "css", ".svg"],
    moduleExtensions: ["node_modules"]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false,
            beautify: false
          }
        }
      })
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, "../template/index.html")
    })
  ]
};
if (config.mode === "development") {
  config.devtool = "source-map";
}
module.exports = config;
