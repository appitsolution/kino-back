import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class error_processed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  last_processed_id: number;
}
