import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Param,
  Patch,
  Delete,
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

      const orderDoc = order as OrderDocument;

      return {
        success: true,
        data: {
          orderId: orderDoc._id.toString(),
          ...orderDoc.toJSON(),
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

      const orderDoc = order as OrderDocument;

      return {
        success: true,
        data: {
          orderId: orderDoc._id.toString(),
          ...orderDoc.toJSON(),
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
        data: history.map(order => ({
          ...(order as OrderDocument).toJSON(),
          orderId: (order as OrderDocument)._id.toString(),
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch order history',
      };
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOrderDetails(@Param('id') orderId: string, @Request() req) {
    try {
      const order = await this.orderService.getOrderById(orderId);
      if (!order || (order as OrderDocument).userId.toString() !== req.user.sub) {
        throw new Error('Order not found or access denied');
      }

      return {
        success: true,
        data: {
          ...(order as OrderDocument).toJSON(),
          orderId: (order as OrderDocument)._id.toString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get order details',
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
        data: {
          ...(updated as OrderDocument).toJSON(),
          orderId: (updated as OrderDocument)._id.toString(),
        },
        message: 'Order status updated',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update status',
      };
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async cancelOrder(@Param('id') orderId: string, @Request() req) {
    try {
      const order = await this.orderService.getOrderById(orderId);
      if (!order || (order as OrderDocument).userId.toString() !== req.user.sub) {
        throw new Error('Order not found or access denied');
      }

      const cancelledOrder = await this.orderService.cancelOrder(orderId);
      return {
        success: true,
        data: {
          ...(cancelledOrder as OrderDocument).toJSON(),
          orderId: (cancelledOrder as OrderDocument)._id.toString(),
        },
        message: 'Order cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
      };
    }
  }
}