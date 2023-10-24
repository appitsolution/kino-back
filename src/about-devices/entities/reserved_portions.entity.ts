import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class reservedPortionsDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: number;

  @Column()
  date: string;

  @Column()
  portions: number;

  @Column()
  price: number;
}
