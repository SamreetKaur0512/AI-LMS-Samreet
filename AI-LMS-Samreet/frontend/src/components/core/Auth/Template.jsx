import { useSelector } from "react-redux"

import frameImg from "../../../assets/Images/frame.png"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ title, description1, description2, image, formType }) {
  const { loading } = useSelector((state) => state.auth)

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col-reverse justify-between gap-y-10 py-8 md:flex-row md:gap-x-12 md:gap-y-0 md:py-12">
          <div className="mx-auto w-full max-w-[450px] md:mx-0">
            <h1 className="text-[1.65rem] font-semibold leading-tight text-richblack-5 sm:text-[1.875rem] sm:leading-[2.375rem]">
              {title}
            </h1>
            <p className="mt-4 text-base leading-[1.625rem] sm:text-[1.125rem]">
              <span className="text-richblack-100">{description1}</span>{" "}
              <span className="font-edu-sa font-bold italic text-blue-100">
                {description2}
              </span>
            </p>
            {formType === "signup" ? <SignupForm /> : <LoginForm />}
          </div>
          <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[450px] md:mx-0">
            <img
              src={frameImg}
              alt="Pattern"
              width={558}
              height={504}
              loading="lazy"
            />
            <img
              src={image}
              alt="Students"
              width={558}
              height={504}
              loading="lazy"
              className="absolute -top-3 right-3 z-10 sm:-top-4 sm:right-4"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Template
