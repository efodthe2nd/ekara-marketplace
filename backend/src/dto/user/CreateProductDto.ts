import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @IsString()
    manufacturer: string;

    @IsOptional()
    @IsArray()
    images?: string[];

    @IsString()
    category: string;

    @IsString()
    compatibility: string;

    @IsString()
    dimensions: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weight: number;

    @IsString()
    warranty: string;

    @IsNumber()
    @Min(0)
    stock: number;
}
