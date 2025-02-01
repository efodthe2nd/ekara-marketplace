// src/entities/SellerProfile.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";
import { Review } from "./Review";

@Entity("seller_profiles")
export class SellerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.sellerProfile)
  @JoinColumn()
  user: User;

  @Column({ nullable: true }) // Made optional
  companyName: string;

  @Column({ nullable: true }) // Made optional
  companyDescription: string;

  @Column({ nullable: true }) // Already optional
  website: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @Column({ type: "float", default: 0 })
  rating: number;

  @Column({ default: 0 })
  numReviews: number;

  @OneToMany(() => Review, (review) => review.seller)
  reviews: Review[];

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  phoneNumber: string;
}
