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
    try {
      // Kiểm tra sản phẩm và tồn kho
      for (const item of createOrderDto.products) {
        // Chuyển đổi productId từ string sang number nếu cần
        const productIdNumber = parseInt(item.productId, 10);
        if (isNaN(productIdNumber)) {
          throw new Error(`Invalid product ID: ${item.productId}`);
        }

        const product = await this.productService.findOne(productIdNumber);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }
      }

      // Cập nhật tồn kho
      for (const item of createOrderDto.products) {
        const productIdNumber = parseInt(item.productId, 10);
        const product = await this.productService.findOne(productIdNumber);
        await this.productService.update(productIdNumber, {
          stock: product.stock - item.quantity
        });
      }

      // Tạo đơn hàng mới
      const newOrder = new this.orderModel({
        userId,
        products: createOrderDto.products.map(item => ({
          productId: item.productId, // Giữ nguyên dạng string
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: createOrderDto.totalAmount,
        shippingAddress: createOrderDto.shippingAddress,
        phoneNumber: createOrderDto.phoneNumber,
        notes: createOrderDto.notes,
        status: createOrderDto.status || OrderStatus.PENDING,
      });

      const savedOrder = await newOrder.save();

      // Xóa giỏ hàng
      try {
        await this.cartService.clearCart(userId);
      } catch (error) {
        console.log('Warning: Could not clear cart:', error.message);
        // Không throw error ở đây vì đơn hàng đã được tạo thành công
      }

      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderHistory(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId })
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

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orderModel.findById(orderId).exec();
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { status: OrderStatus.CANCELLED },
      { new: true }
    ).exec();
  }
}