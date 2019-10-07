# @jswf/rfs Remote function system

## 用途

- バックエンドとフロントエンドを最小限の記述で連携させる

## 使い方

- テンプレートの展開  
npx init-rfs

- テンプレートのビルド  
npm build:all

- テンプレートの実行  
npm run

## テンプレートのファイル構成

- src
  - back [バックエンド用ディレクトリ]
    - index.ts バックエンドスタート用ファイル
    - modules  [モジュール格納用]
      - TestModule.ts サンプルモジュール
  - front [フロントエンド用ディレクトリ]
    - index.ts フロントエンドスタート用ファイル
- templte [HTMLテンプレート置き場]
  - index.html 初期ページ用HTML
- dest [コンパイル済みファイル出力用ディレクトリ]

## プログラムの組み方

### バックエンド側

Moduleクラスを継承し、「JS_関数名」というメソッドを作る

```ts
import {Module} from "@jswf/rfs";

export class TestModule extends Module {
  async JS_add(a: number, b: number) {
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
