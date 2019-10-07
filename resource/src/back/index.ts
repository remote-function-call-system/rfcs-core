import { Manager } from "@jswf/rfs";
import * as path from "path";
import express from "express";

//管理用マネージャクラスの作成
const manager = new Manager({
  debug:1,
  modulePath: path.resolve(__dirname, "./modules") //モジュール置き場
});

//Expressの作成
const app = express();
//アクセス用リモードアドレスの設定
manager.init(app, "/scripts");
//静的ファイルの設定(index.jsからの相対パス)
app.use(express.static(path.resolve(__dirname, "../public")));
//待ち受けポート設定
app.listen(8080);
console.info("URL: \u001b[33mhttp://localhost:8080/\u001b[0m");
