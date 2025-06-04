import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MulterModule.register({
      dest: './uploads', // Thư mục lưu trữ ảnh cục bộ
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Chỉ xuất ProductService nếu cần
})
export class ProductModule {}