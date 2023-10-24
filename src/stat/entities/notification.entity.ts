import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  token: string;
}
