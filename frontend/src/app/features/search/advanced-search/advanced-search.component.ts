import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService, SearchFilters } from '@app/core/services/search.service';
import { Course } from '@app/core/models/course.model';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css'],
})
export class AdvancedSearchComponent implements OnInit {
  searchForm: FormGroup;
  courses: Course[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  lastPage = 1;
  suggestions: string[] = [];

  levels = ['beginner', 'intermediate', 'advanced'];
  sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'studentsCount', label: 'Popularity' },
  ];

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      level: [''],
      minPrice: [0],
      maxPrice: [500],
      minRating: [0],
      isFree: [false],
      sortBy: ['createdAt'],
      sortOrder: ['DESC'],
    });
  }

  ngOnInit(): void {
    // Initial search
    this.search();

    // Setup autocomplete
    this.searchForm.get('query')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        if (query && query.length >= 2) {
          this.searchService.getSuggestions(query).subscribe(
            suggestions => this.suggestions = suggestions
          );
        } else {
          this.suggestions = [];
        }
      });

    // Search on form changes
    this.searchForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.search());
  }

  search(page = 1): void {
    this.loading = true;
    this.currentPage = page;

    const filters: SearchFilters = {
      ...this.searchForm.value,
      page,
      limit: 12,
    };

    // Remove empty values
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value === '' || value === null || value === undefined) {
        delete filters[key as keyof SearchFilters];
      }
    });

    this.searchService.searchCourses(filters).subscribe({
      next: (result) => {
        this.courses = result.data;
        this.total = result.total;
        this.lastPage = result.lastPage;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.loading = false;
      },
    });
  }

  selectSuggestion(suggestion: string): void {
    this.searchForm.patchValue({ query: suggestion });
    this.suggestions = [];
  }

  clearFilters(): void {
    this.searchForm.reset({
      query: '',
      level: '',
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
      isFree: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  }
}
