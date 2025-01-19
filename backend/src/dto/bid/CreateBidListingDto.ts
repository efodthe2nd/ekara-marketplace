import { IsString, IsNumber, IsDate, Min } from 'class-validator';

export class CreateBidListingDto {
    @IsNumber()
    productId: number;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    @Min(0)
    startingPrice: number;

    @IsNumber()
    @Min(0)
    minimumIncrement: number;

    @IsDate()
    endTime: Date;
}