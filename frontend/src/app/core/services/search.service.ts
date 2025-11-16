import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Course } from '../models/course.model';

export interface SearchFilters {
  query?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  category?: string;
  isFree?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

interface SearchResult {
  data: Course[];
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchCourses(filters: SearchFilters): Observable<SearchResult> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params = params.append(key, v.toString()));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<SearchResult>(`${this.apiUrl}/courses`, { params });
  }

  getPopularCourses(limit = 10): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/popular`, {
      params: { limit: limit.toString() },
    });
  }

  getTrendingCourses(limit = 10): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/trending`, {
      params: { limit: limit.toString() },
    });
  }

  getRecommendedCourses(limit = 10): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/recommended`, {
      params: { limit: limit.toString() },
    });
  }

  getSuggestions(query: string, limit = 5): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/suggestions`, {
      params: { query, limit: limit.toString() },
    });
  }
}
