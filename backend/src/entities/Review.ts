import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BuyerProfile, Profile } from "./Buyer";
import { SellerProfile } from "./SellerProfile";


@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BuyerProfile)
    buyerReviewer: BuyerProfile;

    @ManyToOne(() => SellerProfile)
    sellerReviewer: SellerProfile;

    @ManyToOne(() => SellerProfile)
    seller: SellerProfile;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @Column({ type: 'jsonb', nullable: true })
    reply: {
        comment: string;
        createdAt: Date;
    } | null;

    @Column({ default: false })
    reported: boolean;

    @Column({ nullable: true })
    reportReason: string;

    @Column({ nullable: true })
    reporterId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}


