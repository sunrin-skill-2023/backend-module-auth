import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { GrpcReflectionModule } from 'nestjs-grpc-reflection';
import { grpcClientOptions } from 'shared/src/options/auth.option';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`],
    }),
    AuthModule,
    GrpcReflectionModule.register(grpcClientOptions),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
