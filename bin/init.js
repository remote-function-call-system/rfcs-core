#!/usr/bin/env node
const { spawn } = require("child_process");

const npm = "npm" + (process.platform === "win32" ? ".cmd" : "");

const fs = require("fs-extra");
console.log("1: copy template files");
fs.copySync("node_modules/@jswf/rfs/resource", ".");

let config = JSON.parse(fs.readFileSync("package.json"));

config.scripts = {
  ...config.scripts,
  ...{
    start: "node --preserve-symlinks dist/app/index.js",
    "build:all": "npm run build:back && npm run build:front",
    "watch:front": "npx webpack -b -w --mode development",
    "build:front": "npx webpack -b",
    "watch:back": "npx tsc -b -w ",
    "build:back": "npx tsc -b "
  }
};
fs.writeFileSync("package.json", JSON.stringify(config, null, "  "), "utf-8");

console.log("2: install packages");
const proc = spawn(
  npm,
  "i -D ts-loader node-sass style-loader sass-loader css-loader url-loader source-map-loader webpack webpack-cli  html-webpack-plugin typescript @types/express @jswf/adapter".split(
    " "
  ),
  { stdio: "inherit" }
);
proc.on("exit", () => {
  console.log(
    "-----------------------------\n" +
      "[Build & Run Command]\n" +
      "npm run build:all\n" +
      "npm start\n" +
      "-----------------------------"
  );
});
