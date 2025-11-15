import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { getDatabaseConfig } from './config/database.config';
import { getRedisConfig } from './config/redis.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { VideosModule } from './modules/videos/videos.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { ForumModule } from './modules/forum/forum.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    VideosModule,
    QuizzesModule,
    CertificatesModule,
    ForumModule,
    ProgressModule,
  ],
})
export class AppModule {}
