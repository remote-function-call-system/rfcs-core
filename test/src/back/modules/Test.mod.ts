import {Module, EXPORT} from "@rfcs/core";

/**
 *テストモジュール
 *
 * @export
 * @class TestModule
 * @extends {amf.Module}
 */
export class TestModule extends Module {
  @EXPORT //このデコレータを付けると外部公開される
  async add(a: number, b: number) {
    return a + b;
  }
}
