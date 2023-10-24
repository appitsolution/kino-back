import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class modules_of_device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus_id: number;

  @Column()
  components_id: number;

  @Column()
  component_type_id: number;
}
