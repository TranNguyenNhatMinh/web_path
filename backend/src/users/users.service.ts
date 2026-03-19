import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  createUser(data: {
    //hàm để AuthService gọi khi register.
    email: string;
    password: string;
    name: string;
    permissions: string[];
  }) {
    return this.userModel.create(data);
  }

  findAll() {
    return this.userModel
      .find()
      .select('-password -refreshTokenHash -refreshTokenExpiresAt')
      .exec();
  }

  findById(id: string) {
    return this.userModel
      .findById(id)
      .select('-password -refreshTokenHash -refreshTokenExpiresAt')
      .exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findByIdForAuth(id: string) {
    return this.userModel.findById(id).exec();
  }

  setRefreshToken(
    userId: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { refreshTokenHash, refreshTokenExpiresAt },
        { returnDocument: 'after' },
      )
      .exec();
  }

  clearRefreshToken(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { refreshTokenHash: null, refreshTokenExpiresAt: null },
        { returnDocument: 'after' },
      )
      .exec();
  }
}
