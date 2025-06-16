import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule} from './config/database.config';
import { AuthModule } from './auth/auth.module';
;


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    DatabaseModule, 
    ProductModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

