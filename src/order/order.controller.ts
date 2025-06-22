import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request, 
  Param,
  Patch
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '../guard/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminGuard } from '../guard/admin.guard';
import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.sub, createOrderDto);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  async getOrderHistory(@Request() req) {
    return this.orderService.getOrderHistory(req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}