import { Adapter } from "@jswf/adapter";

//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", Main);

async function Main() {
  //通信アダプタの作成
  const adapter = new Adapter("scripts");

  //入力用UIの作成
  const body = document.querySelector("body")!;
  const client = document.createElement("div");
  client.style.padding = "1em";
  client.innerHTML = `<input> + <input> <button>=</button> <span>？</span>`;
  body.appendChild(client);

  //各ノードの取得
  const nodes = Array.from<HTMLInputElement>(client.querySelectorAll("input,button,span"));
  //ボタンイベントの処理
  nodes[2].addEventListener("click", async () => {
    //Inputタグから内容を取り出す
    const a = parseInt(nodes[0].value);
    const b = parseInt(nodes[1].value);
    //サーバにデータを送信し、受信完了まで待つ
    const result = (await adapter.exec("TestModule.add", a, b)) as number;
    //結果を書き込む
    nodes[3].textContent = result.toString();
  });
}
