import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    // Kiểm tra sản phẩm tồn tại
    await this.productService.findOne(parseInt(addToCartDto.productId as any));

    let cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(i => 
      i.productId.toString() === addToCartDto.productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += addToCartDto.quantity;
    } else {
      cart.items.push({
        productId: addToCartDto.productId as any,
        quantity: addToCartDto.quantity
      });
    }

    return cart.save();
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId })
      .populate('items.productId', 'id name price image')
      .exec();

    if (!cart) {
      return new this.cartModel({ userId, items: [] });
    }

    return cart;
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    return cart.save();
  }

  async updateItemQuantity(
    userId: string, 
    updateCartDto: UpdateCartDto
  ): Promise<Cart> {
    const { productId, quantity } = updateCartDto;
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) throw new NotFoundException('Item not found in cart');

    item.quantity = quantity;
    return cart.save();
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = [];
    return cart.save();
  }
}