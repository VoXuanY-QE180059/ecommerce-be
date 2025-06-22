import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from '../../product/schemas/product.schema';
import { UserAccount } from '../../auth/schemas/account.schema';

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: UserAccount.name, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: [{
      productId: { type: Types.ObjectId, ref: Product.name, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }],
    default: []
  })
  items: {
    productId: Types.ObjectId;
    quantity: number;
  }[];
}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);