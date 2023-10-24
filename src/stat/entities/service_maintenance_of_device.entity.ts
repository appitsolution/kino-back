import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class service_maintenance_of_device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus_id: number;

  @Column()
  maintenance_id: number;

  @Column()
  value: number;
}
