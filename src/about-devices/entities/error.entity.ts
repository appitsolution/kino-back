import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class errorDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: number;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  text_error: string;
}
