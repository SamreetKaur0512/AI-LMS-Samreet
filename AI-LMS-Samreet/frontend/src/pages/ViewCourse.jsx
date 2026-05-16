import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import {
  getFreeCourseDetails,
  getFullDetailsOfCourse,
} from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"
import { ACCOUNT_TYPE } from "../utils/constants"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [reviewModal, setReviewModal] = useState(false)

  useEffect(() => {
    ;(async () => {
      const courseData = token
        ? await getFullDetailsOfCourse(courseId, token)
        : await getFreeCourseDetails(courseId)
      if (!courseData?.courseDetails) {
        toast.error(courseData?.message || "Could not open this course")
        navigate(`/courses/${courseId}`)
        return
      }
      if (
        token &&
        user?.accountType !== ACCOUNT_TYPE.STUDENT &&
        Number(courseData.courseDetails.price) !== 0
      ) {
        toast.error("Only students can open paid course content.")
        navigate(`/courses/${courseId}`)
        return
      }
      // console.log("Course Data here... ", courseData.courseDetails)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}
