import { useDispatch, useSelector } from "react-redux"
import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../../../../services/formatDate"
import { deleteCourse, fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const TRUNCATE_LENGTH = 30

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    await deleteCourse({ courseId }, token)
    const result = await fetchInstructorCourses(token)
    if (result) setCourses(result)
    setConfirmationModal(null)
    setLoading(false)
  }

  if (!courses?.length) {
    return (
      <div className="py-10 text-center text-2xl font-medium text-richblack-100">
        No courses found
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-xl border border-richblack-800">
        {/* Header */}
        <div className="flex gap-x-10 rounded-t-md border-b border-richblack-800 px-6 py-2">
          <p className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">Courses</p>
          <p className="w-24 text-left text-sm font-medium uppercase text-richblack-100">Duration</p>
          <p className="w-20 text-left text-sm font-medium uppercase text-richblack-100">Price</p>
          <p className="w-20 text-left text-sm font-medium uppercase text-richblack-100">Actions</p>
        </div>
        {/* Rows */}
        {courses.map((course) => (
          <div key={course._id} className="flex gap-x-10 border-b border-richblack-800 px-6 py-8">
            <div className="flex flex-1 gap-x-4">
              <img src={course?.thumbnail} alt={course?.courseName}
                className="h-[148px] w-[220px] rounded-lg object-cover flex-shrink-0" />
              <div className="flex flex-col justify-between">
                <p className="text-lg font-semibold text-richblack-5">{course.courseName}</p>
                <p className="text-xs text-richblack-300">
                  {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                    ? course.courseDescription.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
                    : course.courseDescription}
                </p>
                <p className="text-[12px] text-white">Created: {formatDate(course.createdAt)}</p>
                <StatusBadge status={course.status} />
              </div>
            </div>
            <div className="w-24 text-sm font-medium text-richblack-100 self-center">2hr 30min</div>
            <div className="w-20 text-sm font-medium text-richblack-100 self-center">₹{course.price}</div>
            <div className="w-20 flex items-center gap-2 self-center">
              <ActionButtons course={course} loading={loading} navigate={navigate}
                setConfirmationModal={setConfirmationModal} handleCourseDelete={handleCourseDelete} />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-4 lg:hidden">
        {courses.map((course) => (
          <div key={course._id} className="rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden">
            {/* Thumbnail */}
            <img src={course?.thumbnail} alt={course?.courseName}
              className="w-full h-44 object-cover" />
            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-base font-semibold text-richblack-5">{course.courseName}</p>
              <p className="text-xs text-richblack-300">
                {course.courseDescription.split(" ").length > 20
                  ? course.courseDescription.split(" ").slice(0, 20).join(" ") + "..."
                  : course.courseDescription}
              </p>
              <p className="text-xs text-richblack-300">Created: {formatDate(course.createdAt)}</p>
              <StatusBadge status={course.status} />
              {/* Info row */}
              <div className="flex justify-between items-center border-t border-richblack-700 pt-3 mt-1">
                <div>
                  <p className="text-xs text-richblack-400">Duration</p>
                  <p className="text-sm text-richblack-100 font-medium">2hr 30min</p>
                </div>
                <div>
                  <p className="text-xs text-richblack-400">Price</p>
                  <p className="text-sm text-richblack-100 font-medium">₹{course.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ActionButtons course={course} loading={loading} navigate={navigate}
                    setConfirmationModal={setConfirmationModal} handleCourseDelete={handleCourseDelete} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

function StatusBadge({ status }) {
  return status === COURSE_STATUS.DRAFT ? (
    <p className="flex w-fit items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
      <HiClock size={14} /> Drafted
    </p>
  ) : (
    <p className="flex w-fit items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
        <FaCheck size={8} />
      </div>
      Published
    </p>
  )
}

function ActionButtons({ course, loading, navigate, setConfirmationModal, handleCourseDelete }) {
  return (
    <>
      <button disabled={loading} title="Edit"
        onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
        className="p-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300 text-richblack-100"
      >
        <FiEdit2 size={20} />
      </button>
      <button disabled={loading} title="Delete"
        onClick={() => setConfirmationModal({
          text1: "Do you want to delete this course?",
          text2: "All the data related to this course will be deleted",
          btn1Text: !loading ? "Delete" : "Loading...",
          btn2Text: "Cancel",
          btn1Handler: !loading ? () => handleCourseDelete(course._id) : () => {},
          btn2Handler: !loading ? () => setConfirmationModal(null) : () => {},
        })}
        className="p-2 transition-all duration-200 hover:scale-110 hover:text-[#ff0000] text-richblack-100"
      >
        <RiDeleteBin6Line size={20} />
      </button>
    </>
  )
}