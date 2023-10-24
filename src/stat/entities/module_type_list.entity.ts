import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class module_type_list {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  components_id: number;

  @Column()
  component_type: string;
}
