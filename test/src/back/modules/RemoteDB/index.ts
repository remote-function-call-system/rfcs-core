import { ModuleMap, Module, ModuleInfo, EXPORT } from "@rfcs/core";
import * as typeorm from "typeorm";
import { DatabaseConfigEntity } from "./Entity";

export function Sleep(timeout: number): Promise<void> {
  return new Promise((resolv): void => {
    setTimeout((): void => {
      resolv();
    }, timeout);
  });
}
export interface CustomMap extends ModuleMap {
  connect: [typeorm.Connection];
  disconnect: [];
}
/**
 *外部DBアクセス用
 *
 * @export
 * @class RemoteDB
 * @extends {amf.Module<T>}
 * @template T
 */
export class RemoteDB<T extends CustomMap = CustomMap> extends Module<T> {
  protected static moduleInfo: ModuleInfo = {
    name: "Remote database module",
    version: 1,
    author: "SoraKumo",
    info: "Main database access"
  };
  private entities: ((new () => T) | Function)[] = [];
  private localRepository?: typeorm.Repository<DatabaseConfigEntity>;
  public addEntity<T>(model: (new () => T) | Function) {
    this.entities.push(model);
  }
  public getRepository<T>(model: new () => T): typeorm.Repository<T> {
    if (!this.connection) throw "Error can't local database";
    return this.connection.getRepository(model);
  }
  connection?: typeorm.Connection;

  public getConnection() {
    return this.connection;
  }
  public isConnect() {
    return this.connection && this.connection.isConnected;
  }
  public async onCreateModule() {
    this.getLocalDB().addEntity(DatabaseConfigEntity);
    this.getManager().addEventListener("message", e => {
      if (e === "connect") this.connect();
    });
    return true;
  }
  public async onCreatedModule() {
    const repository = this.getLocalDB().getRepository(DatabaseConfigEntity);
    this.localRepository = repository;
    this.connect();
    return true;
  }
  public async connect() {
    if (await this.open().catch(() => false)) {
      this.output("DB connected");
      return true;
    }
    return false;
  }

  public async open() {
    await this.close();

    if (!this.localRepository) return false;
    const config = await this.localRepository.findOne();
    if (!config) return false;

    const host = config.REMOTEDB_HOST || "localhost";
    const port = config.REMOTEDB_PORT || 0;
    const database = config.REMOTEDB_DATABASE || "postgres";
    const username = config.REMOTEDB_USER || "";
    const password = config.REMOTEDB_PASSWORD || "";

    //オープン前のフラグを設定
    //this.first = true;
    //ユーザ名が設定されていなければ戻る
    if (!username) return false;
    this.connection = await typeorm.createConnection({
      name: "RemoteDB",
      type: "postgres",
      host, // 接続するDBホスト名
      port,
      username, // DBユーザ名
      password, // DBパスワード
      database, // DB名
      synchronize: true,
      logging: false,
      entities: [...this.entities]
    });
    if (this.connection) this.callEvent("connect", this.connection);
    return true;
  }
  public async close() {
    const connection = this.connection;
    if (connection) {
      this.callEvent("disconnect");
      await connection.close();
      this.connection = undefined;
    }
  }

  public isAdmin() {
    if(this.isAuthority("REMOTE_DB_ADMIN"))
      return true;
    return false;
  }
  public async enter(proc: () => void) {
    if (this.isConnect()) {
      proc();
    } else {
      this.addEventListener("connect", () => {
        proc();
      });
    }
  }
  @EXPORT
  public async getConfig() {
    if (!this.isAdmin()) return null;

    if (!this.localRepository) return false;
    const config = await this.localRepository.findOne();
    if (!config) return false;

    const host = config.REMOTEDB_HOST || "localhost";
    const port = config.REMOTEDB_PORT || 0;
    const database = config.REMOTEDB_DATABASE || "postgres";
    const username = config.REMOTEDB_USER || "";
    const password = config.REMOTEDB_PASSWORD || "";

    const result = {
      REMOTEDB_HOST: host,
      REMOTEDB_PORT: port,
      REMOTEDB_DATABASE: database,
      REMOTEDB_USER: username,
      REMOTEDB_PASSWORD: password
    };
    return result;
  }
  @EXPORT
  public async setConfig(config: DatabaseConfigEntity) {
    if (!this.isAdmin()) return null;
    if (!this.localRepository) return null;
    await this.localRepository.clear();
    await this.localRepository.save(config);
    this.getManager().sendMessage("connect");
    return this.connect();
  }
  @EXPORT
  public async getInfo() {
    if (!this.isAdmin() || !this.connection) return null;
    const result = await this.connection.query(
      "select true as connect,current_database() as database,pg_database_size(current_database()) as size,version() as server"
    );
    return result ? result[0] : null;
  }
}
