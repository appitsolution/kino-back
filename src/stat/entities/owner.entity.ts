import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class owners {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner: string;
}
