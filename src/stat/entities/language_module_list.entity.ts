import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class language_module_list {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module_id: number;

  @Column()
  language: string;

  @Column()
  translation: string;
}
