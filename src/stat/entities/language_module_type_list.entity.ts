import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class language_module_type_list {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module_type_id: number;

  @Column()
  language: string;

  @Column()
  translation: string;
}
