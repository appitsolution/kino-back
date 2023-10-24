import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class apparatusDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: number;

  @Column()
  shipment_date: string;

  @Column()
  commissioning_date: string;

  @Column()
  owners_id: number;

  @Column()
  type_id: number;

  @Column()
  user_id: number;
}
