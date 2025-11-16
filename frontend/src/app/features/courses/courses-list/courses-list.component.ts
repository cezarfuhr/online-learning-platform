import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '@app/core/services/courses.service';
import { Course } from '@app/core/models/course.model';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css'],
})
export class CoursesListComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.coursesService.getCourses(this.currentPage, 12).subscribe({
      next: (response) => {
        this.courses = response.data;
        this.totalPages = response.lastPage;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.loading = false;
      },
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCourses();
    }
  }
}
