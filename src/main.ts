import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   const config = new DocumentBuilder()
      .setTitle('API List')
      .setDescription('API description')
      .setVersion('1.0')
      .addTag('API')
      .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api', app, document);

   await app.listen(6000);
}
bootstrap();
