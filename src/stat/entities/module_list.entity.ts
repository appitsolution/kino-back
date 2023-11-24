import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class module_list {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus_type_id: number;

  @Column()
  components: string;
}
