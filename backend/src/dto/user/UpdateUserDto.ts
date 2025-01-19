import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    password?: string;
    
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    address?: string;
    
    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    companyDescription?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsOptional()
   @IsString()
   currentPassword?: string;

   @IsOptional()
   @IsString()
   newPassword?: string;
}