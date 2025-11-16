import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Review, ReviewStats, CreateReviewRequest } from '../models/review.model';

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  createReview(data: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  updateReview(reviewId: string, rating: number, comment?: string): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, { rating, comment });
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  getCourseReviews(
    courseId: string,
    page = 1,
    limit = 10,
    sortBy: 'rating' | 'date' | 'helpful' = 'date'
  ): Observable<ReviewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get<ReviewsResponse>(`${this.apiUrl}/course/${courseId}`, { params });
  }

  getMyReview(courseId: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/course/${courseId}/my-review`);
  }

  markHelpful(reviewId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${reviewId}/helpful`, {});
  }

  unmarkHelpful(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}/helpful`);
  }

  getCourseRatingStats(courseId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/course/${courseId}/stats`);
  }
}
