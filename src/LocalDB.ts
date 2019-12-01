/* eslint-disable no-dupe-class-members */

import * as typeorm from "typeorm";

/**
 *ローカルDB制御用クラス
 *
 * @export
 * @class LocalDB
 * @extends {SQLiteDB}
 */
export class LocalDB {
  public db?: typeorm.Connection;
  private entities:Set<(string | Function | typeorm.EntitySchema<any>)> = new Set();
  public getDB() {
    return this.db;
  }
  public getRepository<T>(model: new () => T): typeorm.Repository<T> {
    if (!this.db) throw new Error("Error can't local database");
    return this.db.getRepository(model);
  }
  public getCustomRepository<T>(model: typeorm.ObjectType<T>): T {
    if (!this.db) throw new Error("Error can't local database");
    return this.db.getCustomRepository(model);
  }
  public async open(options: Partial<typeorm.ConnectionOptions>) {
    const db = await typeorm.createConnection({
      type: "sqlite",
      entities: [__dirname + "/entities/*.js", ... Array.from(this.entities)],
      synchronize: true,
      ...options
    } as typeorm.ConnectionOptions);
    if (db) {
      this.db = db;
      return true;
    }
    return false;
  }
  public addEntity(entity:(string | Function | typeorm.EntitySchema<any>)){
    this.entities.add(entity);
  }


}
