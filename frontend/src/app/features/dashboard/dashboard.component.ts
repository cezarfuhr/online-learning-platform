import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '@app/core/services/courses.service';
import { CourseEnrollment } from '@app/core/models/course.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  enrollments: CourseEnrollment[] = [];
  loading = true;
  stats = {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
  };

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.coursesService.getMyEnrollments().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load enrollments', err);
        this.loading = false;
      },
    });
  }

  calculateStats(): void {
    this.stats.totalCourses = this.enrollments.length;
    this.stats.completedCourses = this.enrollments.filter(
      (e) => e.progress >= 100
    ).length;
    this.stats.inProgressCourses = this.enrollments.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length;
  }
}
