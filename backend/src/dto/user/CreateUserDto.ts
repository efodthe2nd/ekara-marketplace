import { IsEmail, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
   @IsEmail()
   email: string;

   @IsString()
   username: string;

   @IsString()
   password: string;

   @IsString()
   @IsIn(['buyer', 'seller'])
   role: 'buyer' | 'seller';
   
   // Buyer profile fields
   @IsString()
   @IsOptional()
   firstName?: string;

   @IsString()
   @IsOptional()
   lastName?: string;

   @IsString()
   @IsOptional()
   address?: string;
   
   // Seller profile fields
   @IsString()
   @IsOptional()
   companyName?: string;

   @IsString()
   @IsOptional()
   companyDescription?: string;

   @IsString()
   @IsOptional()
   website?: string;
}