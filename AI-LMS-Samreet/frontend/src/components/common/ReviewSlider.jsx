import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { FaStar } from "react-icons/fa"
import { Autoplay, Pagination } from "swiper"
import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, [])

  const visibleReviews = reviews.filter(
    (review) => review?.user && review?.course
  )

  return (
    <div className="text-white w-full">
      <div className="my-[50px] w-full px-4 lg:max-w-maxContent lg:mx-auto lg:px-0">
        <Swiper
          slidesPerView={1}
          spaceBetween={16}
          loop={visibleReviews.length > 3}
          autoplay={
            visibleReviews.length > 1
              ? { delay: 3000, disableOnInteraction: true }
              : false
          }
          pagination={{
            clickable: true,
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 25 },
          }}
          modules={[Pagination, Autoplay]}
          className="w-full pb-12"
        >
          {visibleReviews.map((review, i) => {
            const reviewerName = `${review.user.firstName || ""} ${
              review.user.lastName || ""
            }`.trim() || "Deleted User"
            const reviewText = review.review || ""

            return (
              <SwiperSlide key={review._id || i} style={{ height: "auto" }}>
                <div className="flex flex-col gap-3 bg-richblack-800 p-4 rounded-lg text-[14px] text-richblack-25 h-full min-h-[150px]">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review.user.image
                          ? review.user.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${reviewerName}`
                      }
                      alt=""
                      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h1 className="font-semibold text-richblack-5 truncate">{reviewerName}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500 truncate">
                        {review.course.courseName}
                      </h2>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25 flex-1">
                    {reviewText.split(" ").length > truncateWords
                      ? `${reviewText.split(" ").slice(0, truncateWords).join(" ")} ...`
                      : reviewText}
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-yellow-100">
                      {Number(review.rating || 0).toFixed(1)}
                    </h3>
                    <ReactStars
                      count={5}
                      value={Number(review.rating || 0)}
                      size={20}
                      edit={false}
                      activeColor="#ffd700"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider

