import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  Order, 
  OrderDocument, 
  OrderStatus 
} from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Kiểm tra tồn kho
    for (const item of createOrderDto.items) {
      const product = await this.productService.findOne(parseInt(item.productId));
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${product.name}`);
      }
    }

    // Giảm số lượng tồn kho
    for (const item of createOrderDto.items) {
      const product = await this.productService.findOne(parseInt(item.productId));
      await this.productService.update(parseInt(item.productId), {
        stock: product.stock - item.quantity
      });
    }

    // Tạo đơn hàng
    const newOrder = new this.orderModel({
      userId,
      ...createOrderDto,
      status: OrderStatus.PENDING,
    });

    // Xóa giỏ hàng
    await this.cartService.clearCart(userId);

    return newOrder.save();
  }

  async getOrderHistory(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId })
      .populate('items.productId', 'id name price image')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).exec();
  }
}