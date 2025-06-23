import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '../guard/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminGuard } from '../guard/admin.guard';
import { OrderStatus, OrderDocument } from './schemas/order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.orderService.createOrder(
        req.user.sub,
        createOrderDto,
      );

      const doc = order as OrderDocument;

      return {
        success: true,
        data: {
          orderId: doc._id.toString(),
          ...doc.toObject(),
        },
        message: 'Order created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async createOrderAlternative(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    try {
      const order = await this.orderService.createOrder(
        req.user.sub,
        createOrderDto,
      );

      const doc = order as OrderDocument;

      return {
        success: true,
        data: {
          orderId: doc._id.toString(),
          ...doc.toObject(),
        },
        message: 'Order created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  @Get('history')
  @UseGuards(AuthGuard)
  async getOrderHistory(@Request() req) {
    try {
      const history = await this.orderService.getOrderHistory(req.user.sub);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch order history',
      };
    }
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    try {
      const updated = await this.orderService.updateOrderStatus(
        orderId,
        status,
      );
      return {
        success: true,
        data: updated,
        message: 'Order status updated',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update status',
      };
    }
  }
}
