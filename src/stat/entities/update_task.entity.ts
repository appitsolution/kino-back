import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class update_task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus: string;

  @Column()
  applied: number;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column()
  value: string;
}
