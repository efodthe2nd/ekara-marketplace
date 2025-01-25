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

    @IsNumber()
    categoryId: number;

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

    @IsString()
    condition: string;

    @IsOptional()
    files?: Express.Multer.File[];
}
