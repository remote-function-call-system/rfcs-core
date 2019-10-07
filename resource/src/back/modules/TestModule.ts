import {Module} from "@jswf/rfs";

/**
 *テストモジュール
 *
 * @export
 * @class TestModule
 * @extends {amf.Module}
 */
export class TestModule extends Module {
  async JS_add(a: number, b: number) {
    return a + b;
  }
}
