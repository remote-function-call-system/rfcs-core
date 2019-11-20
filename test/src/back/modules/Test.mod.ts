import { Module, EXPORT, ModuleInfo } from "@rfcs/core";

/**
 *テストモジュール
 *
 * @export
 * @class TestModule
 * @extends {amf.Module}
 */
export class TestModule extends Module {
  static moduleInfo: ModuleInfo = {
    name: "テストモジュール",
    author: "SoraKumo",
    version: 1
  };
  @EXPORT //このデコレータを付けると外部公開される
  async add(a: number, b: number) {
    return a + b;
  }
}
