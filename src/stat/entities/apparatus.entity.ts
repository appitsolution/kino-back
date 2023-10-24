import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class apparatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: string;

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
  @Column()
  dealer_id: number;
  @Column()
  operator_id: number;
  @Column()
  number_score: string;
  @Column()
  number_act: string;
}
