import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { Certificate } from './entities/certificate.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseEnrollment, EnrollmentStatus } from '../courses/entities/course-enrollment.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async generateCertificate(userId: string, courseId: string): Promise<Certificate> {
    // Check if enrollment is completed
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: EnrollmentStatus.COMPLETED
      },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException('Course not completed or enrollment not found');
    }

    // Check if certificate already exists
    let certificate = await this.certificateRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (certificate) {
      return certificate;
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const verificationCode = uuidv4();

    certificate = this.certificateRepository.create({
      certificateNumber,
      user: enrollment.user,
      course: enrollment.course,
      issuedAt: new Date(),
      finalScore: enrollment.progress,
      verificationCode,
      isVerified: true,
    });

    await this.certificateRepository.save(certificate);

    // Generate PDF (simplified version)
    await this.generatePDF(certificate);

    return certificate;
  }

  private async generatePDF(certificate: Certificate): Promise<void> {
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      // In production, upload to S3 and save URL
      certificate.pdfUrl = `https://certificates.example.com/${certificate.certificateNumber}.pdf`;
    });

    // Add certificate content
    doc
      .fontSize(40)
      .text('Certificate of Completion', 100, 100, { align: 'center' });

    doc
      .fontSize(20)
      .text(`This certifies that`, 100, 200, { align: 'center' });

    doc
      .fontSize(30)
      .text(`${certificate.user.firstName} ${certificate.user.lastName}`, 100, 250, { align: 'center' });

    doc
      .fontSize(20)
      .text(`has successfully completed`, 100, 320, { align: 'center' });

    doc
      .fontSize(25)
      .text(`${certificate.course.title}`, 100, 370, { align: 'center' });

    doc
      .fontSize(15)
      .text(`Certificate Number: ${certificate.certificateNumber}`, 100, 450, { align: 'center' });

    doc
      .fontSize(12)
      .text(`Issued on: ${certificate.issuedAt.toLocaleDateString()}`, 100, 480, { align: 'center' });

    doc.end();
  }

  async verifyCertificate(certificateNumber: string): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateNumber },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
    });
  }
}
