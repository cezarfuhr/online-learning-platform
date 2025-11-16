export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  editedAt?: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewRequest {
  courseId: string;
  rating: number;
  comment?: string;
}
