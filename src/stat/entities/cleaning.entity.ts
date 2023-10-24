import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class cleaning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column()
  user_id: number;

  @Column()
  serial_number: string;
}
