import * as uuid from "uuid";
import * as typeorm from "typeorm";

@typeorm.Entity()
export class SessionEntity extends typeorm.BaseEntity {
  @typeorm.PrimaryColumn()
  id!: string;
  @typeorm.Column()
  type!: string;
  @typeorm.Index()
  @typeorm.Column({ type: "real", default: () => "current_timestamp" })
  date!: Date;
  @typeorm.Column({ default: "{}" })
  server!: string;
}


@typeorm.EntityRepository(SessionEntity)
export class SessionRepository extends typeorm.Repository<SessionEntity> {

  /**
   *セッションの開始と関連データの更新
   *
   * @param {string} hash
   * @param {number} expire
   * @returns {Promise<{ hash: string, values: { [key: string]: any }}>}
   * @memberof LocalDB
   */
  public async startSession(
    type: string,
    hash: string | null,
    expire: number
  ): Promise<{ hash: string; values: { [key: string]: any } }> {
    let id = hash;
    if (id) {
      //一時間経過したセッションを削除
      await this.createQueryBuilder()
        .delete()
        .where(
          "date < datetime(current_timestamp , '-' || :expire ||' second') and type=:type",
          { expire, type }
        )
        .execute();
      //セッションを抽出
      let result = await this.findOne({ id, type });
      if (result) {
        //セッションの有効時間を延期
        await this.createQueryBuilder()
          .update()
          .set({ date: () => "current_timestamp" })
          .where("id=:id", { id })
          .execute();
        return {
          hash: result.id as string,
          values: JSON.parse(result.server as string)
        };
      }
    }
    return { hash: await this.createSession(type), values: {} };
  }
  /**
   *セッションの作成
   *
   * @param {string} type セッションタイプ GLOBAL | SESSION
   * @returns {Promise<string>}
   * @memberof LocalDB
   */
  public async createSession(type: string): Promise<string> {
    let id: string | null = uuid.v4();

    do {
      const result = await this.findOne({ id: id as string, type });
      if (result) id = null;
    } while (id === null);
    await this.insert({ id: <string>id, type });

    return id;
  }
  /**
   *セッションの終了とデータの保存
   *
   * @param {string} hash
   * @param {{[key:string]:any}} values
   * @returns
   * @memberof LocalDB
   */
  public async endSession(
    hash: string,
    values: { [key: string]: unknown }
  ): Promise<boolean> {
    this.createQueryBuilder()
      .update()
      .set({
        date: () => "current_timestamp",
        server: JSON.stringify(values)
      })
      .where("id=:id", { id: hash })
      .execute();
    return true;
  }

}