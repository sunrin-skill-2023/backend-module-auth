import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  grpcClientOptions,
  serviceHost,
  servicePort,
} from 'shared/src/options/auth.option';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcClientOptions,
  );
  await app.listen();

  Logger.log(
    `Microservice is listening on ${serviceHost}:${servicePort}`,
    'Bootstrap',
  );
}
bootstrap();
