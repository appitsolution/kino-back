import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class popcorn_level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column()
  level: number;

  @Column()
  serial_number: string;

  @Column()
  user_id: number;
}
