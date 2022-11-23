/* eslint-disable no-dupe-class-members */

import * as typeorm from "typeorm";
import { ObjectLiteral } from "typeorm";

/**
 *ローカルDB制御用クラス
 *
 * @export
 * @class LocalDB
 * @extends {SQLiteDB}
 */
export class LocalDB {
  public db?: typeorm.DataSource;
  private entities: Set<(string | Function | typeorm.EntitySchema<any>)> = new Set();
  public getDB() {
    return this.db;
  }
  public getRepository<T extends ObjectLiteral>(model: new () => T): typeorm.Repository<T> {
    if (!this.db) throw new Error("Error can't local database");
    return this.db.getRepository(model);
  }
  public getCustomRepository<T>(model: typeorm.ObjectType<T>): T {
    if (!this.db) throw new Error("Error can't local database");
    return this.db.getRepository(model) as never;
  }
  public async open(options: Partial<typeorm.DataSourceOptions>) {
    const db = new typeorm.DataSource({
      type: "sqlite",
      entities: [__dirname + "/entities/*.js", ...Array.from(this.entities)],
      synchronize: true,
      ...options
    } as typeorm.DataSourceOptions);
    await db.initialize();
    if (db) {
      this.db = db;
      return true;
    }
    return false;
  }
  public addEntity(entity: (string | Function | typeorm.EntitySchema<any>)) {
    this.entities.add(entity);
  }


}
