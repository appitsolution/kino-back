import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class service_maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus_type_id: number;

  @Column()
  maintenance: string;
}
