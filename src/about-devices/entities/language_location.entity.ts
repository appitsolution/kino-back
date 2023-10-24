import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class language_location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apparatus_id: number;

  @Column()
  language: string;

  @Column()
  translation: string;
}
