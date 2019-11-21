#!/usr/bin/env node
const { spawn } = require("child_process");

const npm = "npm" + (process.platform === "win32" ? ".cmd" : "");

const fs = require("fs-extra");
console.log("1: copy template files");
fs.copySync("node_modules/@rfcs/core/resource", ".");

let config = JSON.parse(fs.readFileSync("package.json"));

config.scripts = {
  ...config.scripts,
  ...{
    "start": "node --preserve-symlinks dist/app/index.js",
    "test": "node --preserve-symlinks dist/app/index.js --test",
    "build": "npm run build:back && npm run build:front",
    "watch": "concurrently 'npm:watch:back' 'npm:watch:front'",
    "watch:front": "webpack --config src/front/webpack.config.js -w --mode development",
    "build:front": "webpack --config src/front/webpack.config.js",
    "watch:back": "tsc -b src/back -w ",
    "build:back": "tsc -b src/back"
  }
};
fs.writeFileSync("package.json", JSON.stringify(config, null, "  "), "utf-8");

console.log("2: install packages");
const proc = spawn(
  npm,
  "i -D ts-loader node-sass style-loader sass-loader css-loader url-loader source-map-loader webpack webpack-cli  html-webpack-plugin typescript @types/express @jswf/adapter concurrently".split(
    " "
  ),
  { stdio: "inherit" }
);
proc.on("exit", () => {
  console.log(
    "-----------------------------\n" +
      "[Build & Run Command]\n" +
      "npm run build\n" +
      "npm start\n" +
      "-----------------------------"
  );
});
