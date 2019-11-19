import * as typeorm from "typeorm";

@typeorm.Entity()
export class DatabaseConfigEntity extends typeorm.BaseEntity {
  @typeorm.PrimaryGeneratedColumn()
  id?: number;
  @typeorm.Column()
  REMOTEDB_HOST?: string;
  @typeorm.Column({ default: 5432 })
  REMOTEDB_PORT?: number;
  @typeorm.Column()
  REMOTEDB_DATABASE?: string;
  @typeorm.Column()
  REMOTEDB_USER?: string;
  @typeorm.Column()
  REMOTEDB_PASSWORD?: string;
}