import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { FaStar } from "react-icons/fa"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import ReactStars from "react-rating-stars-component"
import { toast } from "react-hot-toast"
import { apiConnector } from "../services/apiconnector"
import { QUIZ_ENDPOINTS } from "../services/apis"

import ConfirmationModal from "../components/common/ConfirmationModal"
import Footer from "../components/common/Footer"
import RatingStars from "../components/common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import { addToCart } from "slices/cartSlice"
import GetAvgRating from "utils/avgRating"
import Error from "./Error"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Getting courseId from url parameter
  const { courseId } = useParams()
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    ;(async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        // console.log("course details res: ", res)
        setResponse(res)
      } catch (error) {
        console.log("Could not fetch Course Details")
      }
    })()
  }, [courseId])

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])
  // console.log("avgReviewCount: ", avgReviewCount)

  // // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e !== id)
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  const [quizLoading, setQuizLoading] = useState(false)
  // Check enrollment using both user.courses and studentsEnrolled array for reliability
  const isUserEnrolled = user && (
    user?.courses?.some(
      (courseRef) => courseRef?.toString() === courseId.toString() || courseRef?._id?.toString() === courseId.toString()
    ) ||
    response?.data?.courseDetails?.studentsEnrolled?.some(
      (s) => s?.toString() === user?._id?.toString() || s?._id?.toString() === user?._id?.toString()
    )
  )

  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!response.success) {
    return <Error />
  }

  const {
      courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = response.data?.courseDetails
  const isFreeCourse = Number(price) === 0
  const firstSection = courseContent?.[0]
  const firstSubSection = firstSection?.subSection?.[0]
  const canStartCourse = firstSection?._id && firstSubSection?._id

  const handleStartCourse = () => {
    if (!canStartCourse) {
      toast.error("This course has no lessons yet.")
      return
    }
    navigate(
      `/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstSubSection._id}`
    )
  }

  const handleBuyCourse = () => {
    if (isFreeCourse) {
      handleStartCourse()
      return
    }
    if (token) {
      buyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  if (paymentLoading) {
    // console.log("payment loading")
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  const handleGenerateQuiz = async () => {
    if (!token) {
      toast.error("Login to generate a quiz for your enrolled course.")
      return
    }

    try {
      setQuizLoading(true)
      const response = await apiConnector(
        "POST",
        QUIZ_ENDPOINTS.GENERATE_QUIZ,
        { courseId },
        {
          Authorization: `Bearer ${token}`,
        }
      )

      if (response?.data?.success) {
        toast.success("Quiz generated successfully. Check My Quizzes.")
      } else {
        throw new Error(response?.data?.message || "Failed to generate quiz")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setQuizLoading(false)
    }
  }

  return (
    <>
      <div className={`relative w-full bg-richblack-800`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            <div className="relative block max-h-[30rem] lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full"
              />
            </div>
            <div
              className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}
            >
              <div>
                <p className="text-3xl font-bold leading-tight text-richblack-5 sm:text-[42px]">
                  {courseName}
                </p>
              </div>
              <p className={`text-richblack-200`}>{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-yellow-25">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>{`(${ratingAndReviews.length} reviews)`}</span>
                <span>{`${studentsEnrolled.length} students enrolled`}</span>
              </div>
              <div>
                <p className="">
                  Created By {`${instructor.firstName} ${instructor.lastName}`}
                </p>
              </div>
              {isUserEnrolled && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    className="yellowButton"
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                  >
                    {quizLoading ? "Generating Quiz..." : "Generate Enrolled Quiz"}
                  </button>
                  <p className="text-sm text-richblack-400 max-w-lg">
                    Request an AI-generated quiz for this course. This only works if you're enrolled in it.
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-base sm:gap-5 sm:text-lg">
                <p className="flex items-center gap-2">
                  {" "}
                  <BiInfoCircle /> Created at {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  {" "}
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
                {isFreeCourse ? "Free" : `Rs. ${price}`}
              </p>
              {isUserEnrolled ? (
                <button
                  className="yellowButton"
                  onClick={() => navigate(`/view-course/${courseId}/section/${response?.data?.courseDetails?.courseContent?.[0]?._id}/sub-section/${response?.data?.courseDetails?.courseContent?.[0]?.subSection?.[0]?._id}`)}
                >
                  Go To Course
                </button>
              ) : (
                <>
                  <button className="yellowButton" onClick={handleBuyCourse}>
                    {isFreeCourse ? "Start Learning" : "Buy Now"}
                  </button>
                  {!isFreeCourse && (
                    <button
                      className="blackButton"
                      onClick={() => {
                        if (!token) {
                          setConfirmationModal({
                            text1: "You are not logged in!",
                            text2: "Please login to add to cart",
                            btn1Text: "Login",
                            btn2Text: "Cancel",
                            btn1Handler: () => navigate("/login"),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                          return
                        }
                        dispatch(addToCart(response?.data?.courseDetails))
                      }}
                    >
                      Add to Cart
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Courses Card */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What will you learn section */}
          <div className="my-8 border border-richblack-600 p-4 sm:p-8">
            <p className="text-2xl font-semibold sm:text-3xl">What you'll learn</p>
            <div className="mt-5">
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-2xl font-semibold sm:text-[28px]">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  <span>{response.data?.totalDuration} total length</span>
                </div>
                <div>
                  <button
                    className="text-yellow-25"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-2xl font-semibold sm:text-[28px]">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>
              <p className="text-richblack-50">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {ratingAndReviews?.length > 0 && (
          <div className="mx-auto box-content px-0 text-start text-richblack-5 lg:w-[1260px] lg:px-4">
            <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
              <div className="my-8 border border-richblack-600 p-4 sm:p-8">
                <p className="text-2xl font-semibold sm:text-3xl">Reviews & Ratings</p>
                <div className="mt-5">
                  {ratingAndReviews.map((review, index) => (
                    <div key={index} className="mb-6 border-b border-richblack-600 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={
                            review?.user?.image
                              ? review?.user?.image
                              : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                          }
                          alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-richblack-5">
                            {`${review?.user?.firstName} ${review?.user?.lastName}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <ReactStars
                              count={5}
                              value={review.rating}
                              size={16}
                              edit={false}
                              activeColor="#ffd700"
                              emptyIcon={<FaStar />}
                              fullIcon={<FaStar />}
                            />
                            <span className="text-yellow-25">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-richblack-25">{review.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails