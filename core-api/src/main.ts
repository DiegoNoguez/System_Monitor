import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Permitir conexiones desde Netlify (en producción puedes poner la URL exacta de Netlify)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  
  // IMPORTANTE: Escuchar en 0.0.0.0 para que el túnel de Cloudflare pueda conectarse
  await app.listen(3000, '0.0.0.0'); 
  console.log(`Core API corriendo y listo para Cloudflare Tunnel`);
}
bootstrap();