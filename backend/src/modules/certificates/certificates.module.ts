import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesService } from './certificates.service';
import { Certificate } from './entities/certificate.entity';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, CourseEnrollment])],
  providers: [CertificatesService],
  exports: [CertificatesService, TypeOrmModule],
})
export class CertificatesModule {}
