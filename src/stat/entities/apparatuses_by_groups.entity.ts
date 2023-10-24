import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class apparatuses_by_groups {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_id: number;

  @Column()
  apparatus_id: number;
}
