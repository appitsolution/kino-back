import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class language_service_maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  maintenance_id: number;

  @Column()
  language: string;

  @Column()
  translation: string;
}
