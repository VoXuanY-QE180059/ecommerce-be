import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { Databaseconfig} from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module'; 
import { OrderModule } from './order/order.module'; 
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    Databaseconfig, 
    ProductModule,
    AuthModule,
    CartModule, 
    OrderModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
