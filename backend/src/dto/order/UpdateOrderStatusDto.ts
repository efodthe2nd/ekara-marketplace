import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../entities/enums/OrderEnums';

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;
}