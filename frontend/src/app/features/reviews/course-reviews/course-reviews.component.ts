import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewsService } from '@app/core/services/reviews.service';
import { AuthService } from '@app/core/services/auth.service';
import { Review, ReviewStats } from '@app/core/models/review.model';

@Component({
  selector: 'app-course-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-reviews.component.html',
  styleUrls: ['./course-reviews.component.css'],
})
export class CourseReviewsComponent implements OnInit {
  @Input() courseId!: string;

  reviews: Review[] = [];
  stats: ReviewStats | null = null;
  myReview: Review | null = null;
  reviewForm: FormGroup;
  loading = false;
  showForm = false;

  constructor(
    private fb: FormBuilder,
    private reviewsService: ReviewsService,
    public authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  ngOnInit(): void {
    this.loadReviews();
    this.loadStats();
    this.loadMyReview();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewsService.getCourseReviews(this.courseId, 1, 10).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.loading = false;
      },
    });
  }

  loadStats(): void {
    this.reviewsService.getCourseRatingStats(this.courseId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  loadMyReview(): void {
    if (this.authService.isAuthenticated()) {
      this.reviewsService.getMyReview(this.courseId).subscribe({
        next: (review) => {
          this.myReview = review;
          if (review) {
            this.reviewForm.patchValue({
              rating: review.rating,
              comment: review.comment,
            });
          }
        },
        error: () => {
          // User hasn't reviewed yet
          this.myReview = null;
        },
      });
    }
  }

  submitReview(): void {
    if (this.reviewForm.invalid) return;

    const data = {
      courseId: this.courseId,
      ...this.reviewForm.value,
    };

    if (this.myReview) {
      // Update existing review
      this.reviewsService.updateReview(this.myReview.id, data.rating, data.comment).subscribe({
        next: () => {
          this.showForm = false;
          this.loadReviews();
          this.loadStats();
          this.loadMyReview();
        },
        error: (err) => console.error('Failed to update review', err),
      });
    } else {
      // Create new review
      this.reviewsService.createReview(data).subscribe({
        next: () => {
          this.showForm = false;
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.loadReviews();
          this.loadStats();
          this.loadMyReview();
        },
        error: (err) => console.error('Failed to create review', err),
      });
    }
  }

  markHelpful(reviewId: string): void {
    this.reviewsService.markHelpful(reviewId).subscribe({
      next: () => this.loadReviews(),
      error: (err) => console.error('Failed to mark helpful', err),
    });
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getRatingPercentage(rating: number): number {
    if (!this.stats || this.stats.totalReviews === 0) return 0;
    const count = this.stats.ratingDistribution[rating] || 0;
    return (count / this.stats.totalReviews) * 100;
  }
}
