import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Delete, 
  Param,
  Put,
  Request
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '../guard/auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, addToCartDto);
  }

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.sub);
  }

  @Delete('remove/:productId')
  async removeFromCart(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user.sub, productId);
  }

  @Put('update')
  async updateItemQuantity(
    @Request() req,
    @Body() updateCartDto: UpdateCartDto
  ) {
    return this.cartService.updateItemQuantity(req.user.sub, updateCartDto);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.sub);
  }
}