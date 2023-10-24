import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class group_listDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  group_name: string;
}
