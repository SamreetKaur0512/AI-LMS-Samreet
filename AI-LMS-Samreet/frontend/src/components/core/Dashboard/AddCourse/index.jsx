import { useEffect } from "react"
import { useDispatch } from "react-redux"

import RenderSteps from "./RenderSteps"
import { resetCourseState } from "slices/courseSlice"

export default function AddCourse() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetCourseState())
  }, [dispatch])

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Add Course
      </h1>
      <div className="mx-auto max-w-[600px]">
        <RenderSteps />
      </div>
    </div>
  )
}
