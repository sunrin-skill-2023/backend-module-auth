import { Controller, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  ICreateAccessTokenByUUIDResponse,
  ICreateUser,
  IToken,
  IUUID,
  PartialUser,
  IUser,
} from 'shared/src/generated/auth.proto';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController, OnModuleInit {
  constructor(private readonly service: AuthService) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onModuleInit() {}

  public async getUserByUuid(request: IUUID): Promise<IUser> {
    return await this.service.getUserByUuid(request);
  }

  getUserByPartialData(
    request: PartialUser,
  ): IUser | Promise<IUser> | Observable<IUser> {
    return this.service.getUserByPartialData(request);
  }

  public async createAccessTokenByUuid({
    uuid,
  }: IUUID): Promise<ICreateAccessTokenByUUIDResponse> {
    return await this.service.createAccessTokenByUuid({ uuid });
  }

  public async getAccessTokenIsValid({ token }: IToken): Promise<IUser> {
    return await this.service.getAccessTokenIsValid({ token });
  }

  public async createUser(request: ICreateUser): Promise<IUser> {
    return await this.service.createUser(request);
  }
}
