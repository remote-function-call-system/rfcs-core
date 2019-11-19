# @jswf/rfs Remote function system

## 用途

- バックエンドとフロントエンドを最小限の記述で連携させる

## 使い方

- テンプレートの展開
npx init-rfs

- テンプレートのビルド
npm build

- テンプレートの実行
npm run

- テストの実行
npm run test

## テンプレートのファイル構成

```txt
.
│  tsconfig.json バックエンドコンパイル用
│
└─src
    ├─back [バックエンド用ディレクトリ]
    │  │  index.ts バックエンドスタート用ファイル
    │  │  tsconfig.json バックエンドコンパイル用
    │  │
    │  ├─modules [モジュール格納用]
    │  │      TestModule.ts サンプルモジュール
    │  │
    │  └─test
    │          index.ts バックエンドテストコード
    │
    ├─front [フロントエンド用ディレクトリ]
    │      index.ts フロントエンドスタート用ファイル
    │      tsconfig.json フロントエンドコンパイル用
    │      webpack.config.js フロントエンドビルド用
    │
    └─template [HTMLテンプレート置き場]
            index.html 初期ページ用HTML
```

## プログラムの組み方

### バックエンド側

Moduleクラスを継承しメソッドを@EXPORTでデコレーションすると、
フロントエンド側から呼び出しが可能となる

```ts
import {Module, EXPORT} from "@jswf/rfs";

/**
 *テストモジュール
 *
 * @export
 * @class TestModule
 * @extends {Module}
 */
export class TestModule extends Module {
  @EXPORT //このデコレータを付けると外部公開される
  async add(a: number, b: number) {
    return a + b;
  }
}
```

### フロントエンド側

Adapterクラスのインスタンスを作成し、adapter.execでバックエンド側のメソッドを呼び出す

```ts
const adapter = new Adapter("scripts");
const result = (await adapter.exec("TestModule.add", a, b)) as number;
```

## 関連リンク

[ドキュメント](https://ttis.croud.jp/?uuid=71ba22b3-2a2f-493b-aa25-e6ffa21c7f72)

## ライセンス

- MITライセンス
