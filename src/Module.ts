import { Manager } from "./Manager";
import { Session } from "./Session";
import * as express from "express";

import "reflect-metadata"; //npmから追加インストールの必要あり

//型のチェック
function isType(type: object, value: unknown) {
  switch (type) {
    case Number:
      if (typeof value !== "number") return false;
      break;
    case String:
      if (typeof value !== "string") return false;
      break;
    case Boolean:
      if (typeof value !== "boolean") return false;
      break;
    case Array:
      if (!(value instanceof Array)) return false;
      break;
    case Function:
      if (!(value instanceof Function)) return false;
      break;
  }
  return true;
}
//型チェック用デコレータ
export function EXPORT(
  target: any,
  name: string,
  descriptor: PropertyDescriptor
) {
  const ptypes = Reflect.getMetadata(
    "design:paramtypes",
    target,
    name
  ) as object[];
  const rtype = Reflect.getMetadata(
    "design:returntype",
    target,
    name
  ) as object[];
  const result = {
    ...descriptor,
    value: function(...params: unknown[]) {
      if (ptypes.length !== params.length) throw new Error("Invalid number of arguments");
      const flag = ptypes.reduce((a, b, index) => {
        return a && isType(b, params[index]);
      }, true);
      if (!flag) {
        throw new Error("Invalid argument type");
      }
      const result = descriptor.value.apply(this, params);
      if (!isType(rtype, result)) throw new Error("Invalid return type");
      return result;
    }
  };
  (result.value as typeof result.value & {
    RFS_EXPORT: boolean;
  }).RFS_EXPORT = true;
  return result;
}

export interface ModuleInfo {
  className?: string;
  name?: string;
  version?: number;
  author?: string;
  info?: string;
}
export interface ModuleMap {
  [key: string]: unknown[];
}
export type ImportModules = {
  new (manager: Manager): Module;
}[];

/**
 *モジュール作成用基本クラス
 *
 * @export
 * @class Module
 */
export class Module<T extends ModuleMap = ModuleMap> {
  protected static moduleInfo?: ModuleInfo;
  public static importModules?: ImportModules;
  private listeners: {
    [key: string]: unknown[];
  } = {};
  public static ModuleIdentification: boolean = true;
  private manager: Manager;
  private session: Session | null = null;
  public static getLocalEntitys(): unknown[] {
    return [];
  }
  /**
   *モジュールの情報を返す
   *モジュール追加時にオーバライドして情報を書き換える
   *
   * @static
   * @returns {ModuleInfo}
   * @memberof Module
   */
  public static getModuleInfo(): NonNullable<ModuleInfo> {
    const defaultInfo = {
      className: this.name,
      name: "Module",
      version: 1,
      author: "",
      info: ""
    };
    return { ...defaultInfo, ...this.moduleInfo };
  }
  public static getImportModules(){
    return Module.importModules;
  }
  /**
   *Creates an instance of Module.
   * @param {Manager} manager
   * @memberof Module
   */
  public constructor(manager: Manager) {
    this.manager = manager;
  }
  /**
   *モジュール対応イベントの追加
   *
   * @template K
   * @param {(K & string)} name
   * @param {(...params: T[K]) => void} proc
   * @returns {void}
   * @memberof Module
   */
  public addEventListener<K extends keyof T>(
    name: K & string,
    proc: (...params: T[K]) => void
  ): void {
    const listener = this.listeners[name];
    if (!listener) {
      this.listeners[name as string] = [proc];
      return;
    }
    if (listener.indexOf(proc) >= 0) return;
    listener.push(proc);
  }

  /**
   *モジュール対応イベントの削除
   *
   * @template K
   * @param {(K & string)} name
   * @param {(...params: T[K]) => void} proc
   * @returns {void}
   * @memberof Module
   */
  public removeEventListener<K extends keyof T>(
    name: K & string,
    proc: (...params: T[K]) => void
  ): void {
    const listener = this.listeners[name];
    if (!listener) {
      this.listeners[name as string] = [proc];
      return;
    }
    const index = listener.indexOf(proc);
    if (index < 0) return;
    listener.splice(index, 1);
  }
  /**
   *イベントを呼び出す
   *
   * @template K
   * @param {(K & string)} name
   * @param {...T[K]} params
   * @memberof Module
   */
  public callEvent<K extends keyof T>(name: K & string, ...params: T[K]): void {
    const listener = this.listeners[name];
    if (listener) {
      for (const proc of listener) {
        (proc as (...params: T[K]) => unknown)(...params);
      }
    }
  }

  /**
   *セッション開始時に必ず呼び出される
   *
   * @returns {Promise<void>}
   * @memberof Module
   */
  public async onStartSession?(): Promise<void>;

  /**
   *セッション終了時に必ず呼び出される
   *
   * @returns {Promise<void>}
   * @memberof Module
   */
  public async onEndSession?(): Promise<void>;

  /**
   *テストモード時に初期化後に呼び出される
   *
   * @returns {Promise<void>}
   * @memberof Module
   */
  public async onTest?(): Promise<void>;
  /**
   *
   *
   * @returns {Manager}
   * @memberof Module
   */
  public getManager(): Manager {
    return this.manager;
  }
  /**
   *
   *
   * @param {Session} session
   * @memberof Module
   */
  public setSession(session: Session): void {
    this.session = session;
  }
  /**
   *
   *
   * @returns {express.Response}
   * @memberof Module
   */
  public getResponse(): express.Response {
    return this.getSession().getResponse();
  }
  /**
   *
   *
   * @returns {Session}
   * @memberof Module
   */
  public getSession(): Session {
    if (!this.session) throw new Error("Session Error");
    return this.session;
  }
  public isSession(): boolean {
    return !!this.session;
  }
  /**
   *
   *
   * @param {boolean} flag
   * @memberof Module
   */
  public setReturn(flag: boolean) {
    if (this.session) this.session.setDefaultReturn(flag);
  }
  /**
   *
   *
   * @param {string} name
   * @param {unknown} [defValue]
   * @returns {unknown}
   * @memberof Module
   */
  public getGlobalItem(name: string, defValue?: unknown): unknown {
    return this.session ? this.session.getGlobalItem(name, defValue) : null;
  }
  /**
   *
   *
   * @param {string} name
   * @param {unknown} value
   * @memberof Module
   */
  public setGlobalItem(name: string, value: unknown): void {
    if (this.session) this.session.setGlobalItem(name, value);
  }
  /**
   *
   *
   * @param {string} name
   * @param {unknown} [defValue]
   * @returns {unknown}
   * @memberof Module
   */
  public getSessionItem(name: string, defValue?: unknown): unknown {
    return this.session ? this.session.getSessionItem(name, defValue) : null;
  }
  /**
   *
   *
   * @param {string} name
   * @param {unknown} value
   * @memberof Module
   */
  public setSessionItem(name: string, value: unknown): void {
    if (this.session) this.session.setSessionItem(name, value);
  }
  /**
   *
   *
   * @param {string} msg
   * @param {...unknown[]} params
   * @memberof Module
   */
  public output(msg: string, ...params: unknown[]): void {
    this.manager.output(msg, ...params);
  }
  /**
   *
   *
   * @returns {Promise<boolean>}
   * @memberof Module
   */
  public async onCreateModule(): Promise<boolean> {
    return true;
  }
  public async onCreatedModule(): Promise<boolean> {
    return true;
  }
  /**
   *
   *
   * @returns {Promise<boolean>}
   * @memberof Module
   */
  public async onDestroyModule(): Promise<boolean> {
    return true;
  }

  /**
   *モジュールインスタンスの取得
   *返ってくる値はPromiseなので注意
   * @template T
   * @param {{
   *     new (manager: Manager): T;
   *   }} constructor
   * @returns {(Promise<T | null>)}
   * @memberof Module
   */
  public async getModule<T extends Module>(constructor: {
    new (manager: Manager): T;
  }): Promise<T> {
    return this.isSession()
      ? this.getSession().getModule(constructor)
      : this.manager.getModule(constructor);
  }

  /**
   *セッション情報を含んだモジュールインスタンスの取得
   *@EXPORT の命令以降で使用しないと例外を発生させる
   * @template T
   * @param {{
   *     new (manager: Manager): T;
   *   }} constructor
   * @returns {T}
   * @memberof Module
   */
  public getSessionModule<T extends Module>(constructor: {
    new (manager: Manager): T;
  }): T {
    if (!this.getSession()) throw new Error("セッション情報が存在しない");
    return this.getSession().getModule(constructor);
  }
  public isAuthority(item: string) {
    const session = this.getSession();
    if (!session) return true;
    const authoritys = this.getSessionItem("AUTHORITYS");
    if (authoritys instanceof Array) {
      const items = new Set(authoritys);
      return items.has("ALL") || items.has(item);
    }
    return false;
  }
  public setAuthority(item: string) {
    const session = this.getSession();
    if (!session) return false;
    const authoritys = this.getSessionItem("AUTHORITYS");
    this.setSessionItem(
      "AUTHORITYS",
      authoritys instanceof Array ? [...authoritys, item] : [item]
    );
    return true;
  }
  /**
   *カスタムコマンドの追加
   *  /?cmd=コマンド
   *上記に対応した専用機能が追加できる
   * @param {string} name
   * @param {(req: express.Request, res: express.Response) => void} proc
   * @memberof Module
   */
  public addCommand(
    name: string,
    proc: (req: express.Request, res: express.Response) => void
  ): void {
    this.getManager().addCommand(name, proc);
  }

  /**
   *クライアントに通常データを戻すか指定する
   *特殊なデータを戻す場合はfalseを設定する
   *この機能は単独命令実行でしか使えないので注意すること
   * @param {boolean} flag true:通常 false:カスタマイズ
   * @memberof Module
   */
  public setDefaultReturn(flag: boolean) {
    this.getSession().setDefaultReturn(flag);
  }
  public getLocalDB() {
    return this.manager.getLocalDB();
  }
}
