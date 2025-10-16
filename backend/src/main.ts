// Modulos Node
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Moduloss Externos
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Modulos Internos
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    // Enable CORS with better security
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', ],
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

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle('Mirage API')
      .setDescription('API Documentation for Mirage - Passwordless Authentication System')
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticación')
      .addTag('users', 'Gestión de usuarios')
      .addTag('health', 'Health checks del sistema')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingresa tu JWT token',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Mirage API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customCss: '.swagger-ui .topbar { display: none }',
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port);

    Logger.log(`🚀 API running on port: ${port}`);
    Logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
    Logger.log(`📁 Static files: ${uploadsPath}`);
    Logger.log(`🔄 Hot reload enabled for development`);
  } catch (error) {
    Logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
