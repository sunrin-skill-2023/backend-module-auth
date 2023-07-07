import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AuthServiceController,
  ICreateAccessTokenByUUIDResponse,
  ICreateUser,
  IUUID,
  IUser,
} from 'shared/src/generated/auth.proto';
import { UserEntity } from 'shared/src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { IToken } from 'shared/src/generated/auth.proto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly user: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getUserByUuid({ uuid }: IUUID): Promise<IUser> {
    const user = await this.user.findOneBy({ uuid });

    if (!user)
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });

    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async getUserByPartialData(param: Partial<IUser>) {
    const user = await this.user.findOneBy(param);

    if (!user)
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });

    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createAccessTokenByUuid({
    uuid,
  }: IUUID): Promise<ICreateAccessTokenByUUIDResponse> {
    const user = await this.user.findOneBy({ uuid });

    if (!user)
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });

    const token = await this.generateAccessToken(user);
    return { token };
  }

  async createUser(req: ICreateUser): Promise<IUser> {
    const user = await this.user.findOneBy({ email: req.email });

    if (user)
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User already exists',
      });

    const newUser = await this.user.save({
      name: req.name,
      email: req.email,
    });

    return newUser;
  }

  async getAccessTokenIsValid({ token }: IToken): Promise<IUser> {
    try {
      const { email } = await this.jwt.verify(token);
      const user = await this.user.findOneBy({ email });
      return user;
    } catch (err: any) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid token',
      });
    }
  }

  async generateAccessToken(
    user: Pick<IUser, 'uuid' | 'email' | 'name'>,
  ): Promise<string> {
    return await this.jwt.signAsync(
      {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '1d'),
      },
    );
  }
}
