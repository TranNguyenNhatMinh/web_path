import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  // Danh sách quyền của user, ví dụ: ['USER_VIEW'], ['USER_VIEW', 'ADMIN_ACCESS']
  @Prop({ type: [String], default: ['USER_VIEW'] })
  permissions: string[];

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;

  @Prop({ type: Date, default: null })
  refreshTokenExpiresAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
