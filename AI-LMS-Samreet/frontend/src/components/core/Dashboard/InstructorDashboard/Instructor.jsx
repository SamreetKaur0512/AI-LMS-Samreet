import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI'
import { getInstructorData } from '../../../../services/operations/profileAPI'
import InstructorChart from './InstructorChart'
import { Link } from 'react-router-dom'

export default function Instructor() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      if (instructorApiData?.length) setInstructorData(instructorApiData)
      if (result) setCourses(result)
      setLoading(false)
    })()
  }, [])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)

  return (
    <div className="px-2 sm:px-0">
      {/* Greeting */}
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-richblack-5">Hi {user?.firstName} 👋</h1>
        <p className="font-medium text-richblack-200">Let's start something new</p>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : courses.length > 0 ? (
        <div className="space-y-6">

          {/* Chart + Statistics — stacks on mobile, side by side on desktop */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Chart */}
            <div className="flex-1 min-h-[300px]">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="h-full rounded-md bg-richblack-800 p-6 flex flex-col justify-center">
                  <p className="text-lg font-bold text-richblack-5">Visualize</p>
                  <p className="mt-4 text-xl font-medium text-richblack-50">
                    Not Enough Data To Visualize
                  </p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="flex flex-row lg:flex-col lg:min-w-[250px] rounded-md bg-richblack-800 p-6 gap-4 lg:gap-0">
              <p className="hidden lg:block text-lg font-bold text-richblack-5 mb-4">Statistics</p>
              {/* Mobile: horizontal stat cards */}
              <div className="flex flex-row lg:flex-col gap-4 lg:gap-0 lg:space-y-4 w-full">
                <div className="flex-1 lg:flex-none bg-richblack-700 lg:bg-transparent rounded-lg p-3 lg:p-0">
                  <p className="text-sm lg:text-lg text-richblack-200">Total Courses</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-richblack-50">{courses.length}</p>
                </div>
                <div className="flex-1 lg:flex-none bg-richblack-700 lg:bg-transparent rounded-lg p-3 lg:p-0">
                  <p className="text-sm lg:text-lg text-richblack-200">Total Students</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-richblack-50">{totalStudents}</p>
                </div>
                <div className="flex-1 lg:flex-none bg-richblack-700 lg:bg-transparent rounded-lg p-3 lg:p-0">
                  <p className="text-sm lg:text-lg text-richblack-200">Total Income</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-richblack-50">₹{totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Courses */}
          <div className="rounded-md bg-richblack-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold text-richblack-5">Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className="text-xs font-semibold text-yellow-50">View All</p>
              </Link>
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[140px] w-full rounded-md object-cover"
                  />
                  <div className="mt-3">
                    <p className="text-sm font-medium text-richblack-50 line-clamp-2">{course.courseName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-richblack-300">{course?.studentsEnrolled?.length || 0} students</p>
                      <p className="text-xs text-richblack-300">|</p>
                      <p className="text-xs text-richblack-300">₹{course?.price || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 rounded-md bg-richblack-800 p-6 py-20">
          <p className="text-center text-2xl font-bold text-richblack-5">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="mt-1 text-center text-lg font-semibold text-yellow-50">Create a course</p>
          </Link>
        </div>
      )}
    </div>
  )
}