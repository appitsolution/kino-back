import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class actual_popcorn_lvl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serial_number: string;

  @Column()
  actual_lvl: number;

  @Column()
  there_is_a_stock: boolean;
}
