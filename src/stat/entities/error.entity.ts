import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class error {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  text_error: string;

  @Column()
  read: string;
}
