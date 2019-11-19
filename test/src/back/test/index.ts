import { Adapter } from "@jswf/adapter";
import { Server } from "http";

//モジュール型定義
interface AdapterMap {
  "TestModule.add": (a: number, b: number) => number;
}

/**
 *バックエンドテスト
 *
 * @export
 * @param {Server} server 待ち受けServer
 * @param {string} url    接続用URL
 */
export async function test(server:Server,url:string) {
  const adapter = new Adapter<AdapterMap>(url);
  try {
    const result = await adapter.exec("TestModule.add", 100,200);
    if (result !== 100 + 200) throw "NG: TestModule.add";
    console.log("OK: TestModule.add");

  } catch (e) {
    console.error(e);
    server.close(() => process.exit(-1));
  }
  console.log("テストコンプリート")
  server.close(() => process.exit(0));
}
