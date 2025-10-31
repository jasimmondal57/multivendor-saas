'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user: {
    name: string;
  };
  is_verified_purchase: boolean;
  vendor_response: string | null;
  vendor_responded_at: string | null;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/v1/products/${productId}/reviews`);
      setReviews(response.data.data.reviews.data || []);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/v1/customer/reviews', {
        product_id: productId,
        ...formData,
      });
      setShowReviewForm(false);
      setFormData({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const markHelpful = async (reviewId: number, isHelpful: boolean) => {
    try {
      await api.post(`/v1/customer/reviews/${reviewId}/helpful`, { is_helpful: isHelpful });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      {stats && stats.total_reviews > 0 && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {parseFloat(stats.average_rating.toString()).toFixed(1)}
              </div>
              {renderStars(Math.round(parseFloat(stats.average_rating.toString())), 'lg')}
              <div className="text-gray-600 mt-2">{stats.total_reviews} reviews</div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats[`${['one', 'two', 'three', 'four', 'five'][star - 1]}_star` as keyof ReviewStats] as number;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{star} star</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {user && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={submitReview} className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Write Your Review</h3>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Summarize your experience"
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Share your thoughts about this product"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⭐</div>
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{review.user.name}</span>
                    {review.is_verified_purchase && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating, 'sm')}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Vendor Response */}
              {review.vendor_response && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-blue-900">Vendor Response</span>
                    <span className="text-sm text-blue-600">
                      {new Date(review.vendor_responded_at!).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-blue-900">{review.vendor_response}</p>
                </div>
              )}

              {/* Helpful Buttons */}
              {user && (
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <button
                    onClick={() => markHelpful(review.id, true)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Yes ({review.helpful_count})
                  </button>
                  <button
                    onClick={() => markHelpful(review.id, false)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    No ({review.not_helpful_count})
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

