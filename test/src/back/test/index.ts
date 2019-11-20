import { Adapter } from "@rfcs/adapter";
import { Server } from "http";
import { UserInfo, Users } from "@rfcs/user";

//モジュール型定義
interface AdapterMap {
  "TestModule.add": (a: number, b: number) => number;
}
interface AdapterMap {
  "Users.request": () => UserInfo;
  "Users.login": (
    userId: string,
    userPass: string,
    local: boolean,
    keep?: boolean
  ) => Promise<false | UserInfo | null>;
  "Users.logout": typeof Users.prototype.logout;
  "Users.setUser": typeof Users.prototype.setUser;
  "Users.delUser": typeof Users.prototype.delUser;
  "Users.getUsers": typeof Users.prototype.getUsers;
}
/**
 *バックエンドテスト
 *
 * @export
 * @param {Server} server 待ち受けServer
 * @param {string} url    接続用URL
 */
export async function test(server: Server, url: string) {
  console.log("\n----- Start test -----");
  const adapter = new Adapter<AdapterMap>(url);
  try {
    console.log("- 加算テスト");
    const result = await adapter.exec("TestModule.add", 100, 200);
    if (result !== 100 + 200) throw "NG: TestModule.add";
    console.log("OK: TestModule.add");

    console.log("- セッション開始テスト");
    await adapter.exec("Users.request");
    console.log("OK: Users.request");

    console.log("- ユーザ作成テスト");
    await adapter
      .exec("Users.setUser", 0, "test-user", "テストユーザ", "test", true);
    console.log("OK: Users.setUser");

    console.log("\n- ユーザログインテスト");
    await adapter
      .exec("Users.login", "test-user", "test", true, true);
    console.log("OK: Users.login");

    console.log("\n- セッション再確認");
    await adapter.exec("Users.request");
    console.log("OK: Users.request");

    console.log("\n- ログアウト");
    await adapter.exec("Users.logout");
    console.log("OK: Users.logout");

  } catch (e) {
    console.error(e);
    console.log("Test failure");
    server.close(() => process.exit(-1));
  }
  console.log("-- Test complete!!! --");
  server.close(() => process.exit(0));
}
