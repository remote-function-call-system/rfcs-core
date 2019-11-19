import * as typeorm from "typeorm";
@typeorm.Entity()
export class UserEntity  extends typeorm.BaseEntity{
  @typeorm.PrimaryGeneratedColumn() //自動番号
  no!: number;
  @typeorm.Column({ default: true })
  enable!: boolean;
  @typeorm.Column({ unique: true })
  id!: string;
  @typeorm.Column({nullable:true})
  password?: string;
  @typeorm.Column()
  name!: string;
  @typeorm.Column({ default: "{}" })
  info!: string;
}
