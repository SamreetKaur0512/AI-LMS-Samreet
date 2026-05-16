"""
AI-Based Learning Management System
AI Module: Course Recommendation Engine

Developer: Samreet Kaur (2233713)
B.Tech CSE (2022-2026)
Amritsar Group of Colleges, Amritsar

Description:
    Implements a hybrid recommendation system combining:
    - Collaborative Filtering using SVD (Matrix Factorization)
    - Content-Based Filtering using TF-IDF with Cosine Similarity
    Evaluated using RMSE and Precision@K metrics.
"""

import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler


class CollaborativeFilteringEngine:
    """
    Collaborative Filtering using SVD Matrix Factorization.
    Analyzes student-course interaction matrix to find patterns.
    """

    def __init__(self, n_components=50):
        self.n_components = n_components
        self.svd = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_factors = None
        self.item_factors = None
        self.scaler = MinMaxScaler()

    def fit(self, interaction_matrix: pd.DataFrame):
        """
        Train the SVD model on student-course interaction matrix.
        
        Args:
            interaction_matrix: DataFrame where rows=students, cols=courses,
                                 values=engagement scores (0-5 rating)
        """
        matrix = interaction_matrix.fillna(0).values
        self.user_factors = self.svd.fit_transform(matrix)
        self.item_factors = self.svd.components_.T
        print(f"[RecommendationEngine] SVD fitted: {matrix.shape[0]} students, "
              f"{matrix.shape[1]} courses, {self.n_components} latent factors")

    def predict_score(self, student_idx: int, course_idx: int) -> float:
        """Predict the engagement score for a student-course pair."""
        if self.user_factors is None:
            raise ValueError("Model not trained yet. Call fit() first.")
        score = np.dot(self.user_factors[student_idx], self.item_factors[course_idx])
        return float(np.clip(score, 0, 5))

    def get_top_recommendations(self, student_idx: int, n: int = 10,
                                 exclude_enrolled: list = None) -> list:
        """
        Get top N course recommendations for a student.
        
        Args:
            student_idx: Index of the student in the interaction matrix
            n: Number of recommendations to return
            exclude_enrolled: List of course indices already enrolled in
        Returns:
            List of (course_idx, predicted_score) tuples
        """
        if self.user_factors is None:
            raise ValueError("Model not trained yet.")

        scores = np.dot(self.user_factors[student_idx], self.item_factors.T)
        ranked = np.argsort(scores)[::-1]

        if exclude_enrolled:
            ranked = [idx for idx in ranked if idx not in exclude_enrolled]

        top_n = ranked[:n]
        return [(int(idx), float(scores[idx])) for idx in top_n]


class ContentBasedFilteringEngine:
    """
    Content-Based Filtering using TF-IDF and Cosine Similarity.
    Recommends courses similar to what a student has already liked.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.course_vectors = None
        self.course_ids = None

    def fit(self, courses_df: pd.DataFrame):
        """
        Build TF-IDF vectors from course content.
        
        Args:
            courses_df: DataFrame with 'course_id' and 'description' columns
        """
        self.course_ids = courses_df['course_id'].tolist()
        corpus = courses_df['description'].fillna('').tolist()
        self.course_vectors = self.vectorizer.fit_transform(corpus)
        print(f"[ContentEngine] TF-IDF fitted on {len(corpus)} courses")

    def get_similar_courses(self, course_id: str, n: int = 10) -> list:
        """
        Find top N courses similar to a given course.
        
        Args:
            course_id: ID of the reference course
            n: Number of similar courses to return
        Returns:
            List of (course_id, similarity_score) tuples
        """
        if self.course_vectors is None:
            raise ValueError("Model not trained yet. Call fit() first.")

        idx = self.course_ids.index(course_id)
        sim_scores = cosine_similarity(
            self.course_vectors[idx], self.course_vectors
        ).flatten()

        ranked = np.argsort(sim_scores)[::-1]
        ranked = [i for i in ranked if i != idx][:n]
        return [(self.course_ids[i], float(sim_scores[i])) for i in ranked]


class HybridRecommendationEngine:
    """
    Hybrid Recommendation System combining Collaborative and Content-Based filtering.
    Weights can be tuned based on data availability.
    """

    def __init__(self, cf_weight=0.6, cb_weight=0.4):
        self.cf_engine = CollaborativeFilteringEngine()
        self.cb_engine = ContentBasedFilteringEngine()
        self.cf_weight = cf_weight
        self.cb_weight = cb_weight

    def fit(self, interaction_matrix: pd.DataFrame, courses_df: pd.DataFrame):
        """Train both collaborative and content-based engines."""
        print("[HybridEngine] Training Collaborative Filtering...")
        self.cf_engine.fit(interaction_matrix)
        print("[HybridEngine] Training Content-Based Filtering...")
        self.cb_engine.fit(courses_df)
        print("[HybridEngine] Training complete.")

    def recommend(self, student_idx: int, liked_courses: list,
                   exclude_enrolled: list = None, n: int = 10) -> list:
        """
        Generate hybrid recommendations.
        
        Args:
            student_idx: Index of the student
            liked_courses: List of course_ids the student rated highly
            exclude_enrolled: List of course_ids to exclude
            n: Number of final recommendations
        Returns:
            Sorted list of recommended course_ids
        """
        # Collaborative filtering recommendations
        cf_recs = self.cf_engine.get_top_recommendations(
            student_idx, n=n * 2, exclude_enrolled=exclude_enrolled
        )
        cf_scores = {course_idx: score for course_idx, score in cf_recs}

        # Content-based recommendations from liked courses
        cb_scores = {}
        for course_id in liked_courses:
            try:
                similar = self.cb_engine.get_similar_courses(course_id, n=n)
                for sim_id, score in similar:
                    cb_scores[sim_id] = cb_scores.get(sim_id, 0) + score
            except ValueError:
                continue

        # Merge scores with weights
        all_courses = set(list(cf_scores.keys()) + list(cb_scores.keys()))
        final_scores = {}
        for course in all_courses:
            cf_s = cf_scores.get(course, 0) / 5.0  # normalize to 0-1
            cb_s = cb_scores.get(course, 0)
            final_scores[course] = (self.cf_weight * cf_s) + (self.cb_weight * cb_s)

        sorted_recs = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_recs[:n]


# ─── Evaluation Metrics ───────────────────────────────────────────────────────

def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Root Mean Squared Error for rating prediction."""
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def precision_at_k(recommended: list, relevant: list, k: int = 10) -> float:
    """
    Precision@K metric — fraction of top-K recommendations that are relevant.
    
    Args:
        recommended: Ordered list of recommended course IDs
        relevant: Ground truth list of relevant course IDs
        k: Cut-off rank
    """
    top_k = recommended[:k]
    hits = len(set(top_k) & set(relevant))
    return hits / k if k > 0 else 0.0


# ─── Quick Demo ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("EduAI LMS - Course Recommendation Engine Demo")
    print("Developer: Samreet Kaur | AGC Amritsar")
    print("=" * 60)

    # Simulated student-course interaction matrix (students x courses)
    np.random.seed(42)
    n_students, n_courses = 500, 100
    interaction_data = np.random.randint(0, 6, size=(n_students, n_courses)).astype(float)
    # Add sparsity (most students haven't rated most courses)
    mask = np.random.random((n_students, n_courses)) > 0.85
    interaction_data[mask] = 0

    interaction_matrix = pd.DataFrame(
        interaction_data,
        columns=[f"course_{i}" for i in range(n_courses)]
    )

    # Simulated course metadata
    topics = ["machine learning", "web development", "data science",
              "python programming", "deep learning", "algorithms",
              "database management", "cloud computing", "cybersecurity", "AI"]
    courses_df = pd.DataFrame({
        "course_id": [f"course_{i}" for i in range(n_courses)],
        "description": [
            f"Learn {topics[i % len(topics)]} from basics to advanced. "
            f"Hands-on projects and real-world applications included."
            for i in range(n_courses)
        ]
    })

    # Train hybrid engine
    engine = HybridRecommendationEngine(cf_weight=0.6, cb_weight=0.4)
    engine.fit(interaction_matrix, courses_df)

    # Get recommendations for student 0
    student_id = 0
    enrolled = [0, 5, 10]
    liked = ["course_0", "course_5"]

    recommendations = engine.recommend(
        student_idx=student_id,
        liked_courses=liked,
        exclude_enrolled=enrolled,
        n=5
    )

    print(f"\nTop 5 Recommendations for Student {student_id}:")
    for rank, (course, score) in enumerate(recommendations, 1):
        print(f"  {rank}. {course} | Hybrid Score: {score:.4f}")

    # Evaluate CF with RMSE
    actual = interaction_data[student_id]
    predicted = np.array([
        engine.cf_engine.predict_score(student_id, j) for j in range(n_courses)
    ])
    nonzero = actual > 0
    error = rmse(actual[nonzero], predicted[nonzero])
    print(f"\nCollaborative Filtering RMSE: {error:.4f}")

    # Precision@K
    relevant_courses = [f"course_{i}" for i in range(5, 20)]
    rec_course_ids = [f"course_{c}" for c, _ in recommendations]
    pk = precision_at_k(rec_course_ids, relevant_courses, k=5)
    print(f"Precision@5: {pk:.4f}")
    print("\n[Demo complete]")
