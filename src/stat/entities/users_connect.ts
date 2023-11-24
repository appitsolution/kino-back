import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class users_connect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  user_id_s: number;
}
