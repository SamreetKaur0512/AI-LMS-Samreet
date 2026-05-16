import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { apiConnector } from "../../../services/apiconnector"
import { RECOMMENDATION_API, POPULAR_COURSES_API } from "../../../services/apis"
import { FaBrain } from "react-icons/fa"
import { AiOutlineStar } from "react-icons/ai"

const RecommendationSection = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState("")

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        if (token && user) {
          // Logged in — personalized recommendations
          const res = await apiConnector("GET", RECOMMENDATION_API, null, {
            Authorization: `Bearer ${token}`,
          })
          if (res.data.success && res.data.data.length > 0) {
            setCourses(res.data.data)
            setReason("AI-Powered Personalized Recommendations")
          } else {
            // Fallback to popular
            const popRes = await apiConnector("GET", POPULAR_COURSES_API)
            if (popRes.data.success) {
              setCourses(popRes.data.data)
              setReason("Popular Courses")
            }
          }
        } else {
          // Not logged in — popular courses
          const res = await apiConnector("GET", POPULAR_COURSES_API)
          if (res.data.success) {
            setCourses(res.data.data)
            setReason("Popular Courses")
          }
        }
      } catch (error) {
        console.log("Recommendation fetch error:", error)
      }
      setLoading(false)
    }

    fetchRecommendations()
  }, [token, user])

  if (loading) {
    return (
      <div className="w-full py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    )
  }

  if (courses.length === 0) return null

  return (
    <div className="mx-auto w-11/12 max-w-maxContent py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
          <FaBrain size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-richblack-5">
            {token ? "Recommended For You" : "Popular Courses"}
          </h2>
          <p className="text-sm text-richblack-400 flex items-center gap-1">
            <span className="text-yellow-400">✦</span> {reason}
          </p>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course._id}
            to={`/courses/${course._id}`}
            className="group rounded-2xl overflow-hidden bg-richblack-800 border border-richblack-700 hover:border-yellow-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Recommendation Badge */}
              {course.reason && (
                <div className="absolute top-3 left-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-richblack-900">
                  ✦ {course.reason}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-richblack-5 text-base line-clamp-2 group-hover:text-yellow-400 transition-colors">
                {course.courseName}
              </h3>

              <p className="text-xs text-richblack-400 line-clamp-2">
                {course.courseDescription}
              </p>

              <p className="text-xs text-richblack-300">
                By{" "}
                <span className="text-yellow-400">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </p>

              {/* Tags */}
              {course.tag && course.tag.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {course.tag.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-richblack-700 px-2 py-0.5 text-xs text-richblack-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between border-t border-richblack-700 pt-2">
                <div className="flex items-center gap-1 text-xs text-richblack-400">
                  <AiOutlineStar className="text-yellow-400" />
                  <span>{course.studentsEnrolled?.length || 0} students</span>
                </div>
                <span className="font-bold text-yellow-400">
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecommendationSection