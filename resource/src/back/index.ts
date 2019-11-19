import { Manager } from "@jswf/rfs";
import * as path from "path";
import express from "express";
import {test} from "./test";

//起動オプションの確認
const options = new Set(process.argv);
const testMode = options.has("--test");

//Expressの作成
const exp = express();

//管理用マネージャクラスの作成
const manager = new Manager();
manager
  .init(
    {
      //デバッグレベル
      debug: 1,
      //モジュール置き場
      modulePath: path.resolve(__dirname, "./modules")
    },
    exp,        //Express
    "/scripts"  //Remote address
  )
  .then(() => {
    //静的ファイルの設定(index.jsからの相対パス)
    exp.use(express.static(path.resolve(__dirname, "../public")));
    try {
      //待ち受けポート設定
      const server = exp.listen(8080, () => {
        console.log("URL: http://localhost:8080/");
        //テストの実行
        testMode && test(server,"http://localhost:8080/scripts");
      });
    } catch (e) {
      console.error(e);
    }
  })
  .catch(() => {
    console.error("RFS起動エラー");
  });
