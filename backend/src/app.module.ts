import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/infrastructure/users.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { RolesModule } from './modules/roles/infrastructure/roles.module';
import { PermissionsModule } from './modules/permissions/infrastructure/permissions.module';
import { OrganizationModule } from './modules/organizations/infrastructure/organization.module';
import { AccommodationModule } from './modules/accommodations/infrastructure/accommodation.module';

@Module({
  imports: [
    // 1. Configuración Global de Variables de Entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles en toda la app sin re-importar
    }),

    // 2. Módulo del Core (Infraestructura Compartida)
    PrismaModule, // Contiene el PrismaService que se conecta a PostgreSQL

    // 3. Módulos de Negocio (Dominios / Contextos)
    UsersModule, // Maneja el dominio de usuarios y repositorios
    AuthModule,
    PermissionsModule,
    RolesModule,
    OrganizationModule,
    AccommodationModule,
    // Maneja los controladores de login y uso de JWT
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
