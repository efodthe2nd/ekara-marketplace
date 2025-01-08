import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsNumber()
    productId: number;

    @IsNumber()
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    shippingAddress: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}