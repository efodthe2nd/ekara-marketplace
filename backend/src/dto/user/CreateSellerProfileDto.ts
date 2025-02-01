import { IsString, IsOptional } from 'class-validator';

export class CreateSellerProfileDto {
    @IsString()
    companyName: string;

    @IsString()
    @IsOptional()
    companyDescription?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;
}