import { Manager } from "@rfcs/core";
import * as path from "path";
import Express from "express";
import { test } from "./test";

//起動オプションの確認
const options = new Set(process.argv);
const testMode = options.has("--test");

//Expressの作成
const express = Express();

//管理用マネージャクラスの作成
const manager = new Manager();
const scriptPath = "/scripts";
manager
  .init({
    //デバッグレベル
    debug: 1,
    //モジュールディレクトリから一括で読み込む
    moduleDir: path.resolve(__dirname, "./modules"),
    databaseOption: {
      //TypeORMのDB設定(未指定の場合はsqliteがメモリ上に作成される)
      type: "sqlite",
      database: path.resolve(__dirname, "../db/app.db")
    },
    //個別でモジュールを指定する場合
    //module: TestModule,
    express, //Express
    scriptPath //Remote address
  })
  .then(() => {
    //静的ファイルの設定(index.jsからの相対パス)
    express.use(Express.static(path.resolve(__dirname, "../public")));
    try {
      const port = 8080;
      const url = `http://localhost:${port}`;
      //待ち受けポート設定
      const server = express.listen(8080, () => {
        console.log(`URL: ${url}`);
        //テストの実行
        testMode && test(server, `${url}${scriptPath}`);
      });
    } catch (e) {
      console.error(e);
    }
  })
  .catch(() => {
    console.error("RFS起動エラー");
  });
