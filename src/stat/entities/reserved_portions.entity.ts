import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class reservedPortions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  portions: number;

  @Column()
  price: number;
}
