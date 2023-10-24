import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class device_customization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  apparatus_id: number;

  @Column()
  name: string;
}
