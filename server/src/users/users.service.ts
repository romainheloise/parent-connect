import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto, UserInfos } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email } = createUserDto;
    const isDuplicate = await this.findDuplicate(email);

    if (isDuplicate) {
      throw new HttpException(
        '[USERS/CREATE] user already exists ',
        HttpStatus.CONFLICT,
      );
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT);
    const hashPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });

    const newUser = {
      email: email,
      password: hashPassword,
    };

    return await this.userModel.create(newUser);
  }

  private async findDuplicate(email: string): Promise<boolean> {
    const allUsers = await this.findAll();
    const duplicate = allUsers.find((user) => {
      return user.email === email;
    });
    const result = duplicate ? true : false;
    return result;
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne({ id, email }): Promise<UserInfos> {
    const filters: any = {};
    if (id) filters._id = id;
    if (email) filters.email = email;
    return this.userModel.findOne(filters);
  }

  async update(id: string, updateUserDto: any) {
    const filter = { _id: id };

    const update: any = {
      $set: {},
    };

    const setField = {};

    for (const key in updateUserDto) {
      const value = updateUserDto[key];
      if (value) {
        setField[key] = value;
      }
    }
    update.$set = setField;

    return await this.userModel
      .findOneAndUpdate(filter, update, { new: true })
      .lean();
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
