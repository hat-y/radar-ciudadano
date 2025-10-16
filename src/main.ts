// Modulos Node
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Moduloss Externos
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

// Modulos Internos
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    // Enable CORS with better security
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Ensure uploads directory exists
    const uploadsPath = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadsPath)) {
      Logger.log('Creating uploads directory...');
      mkdirSync(uploadsPath, { recursive: true });
    }

    app.useStaticAssets(uploadsPath, {
      prefix: '/static/',
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port);

    Logger.log(`🚀 API running on port: ${port}`);
    Logger.log(`📁 Static files: ${uploadsPath}`);
    Logger.log(`🔄 Hot reload enabled for development`);
  } catch (error) {
    Logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
