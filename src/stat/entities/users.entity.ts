import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  created_at: Date;
}
