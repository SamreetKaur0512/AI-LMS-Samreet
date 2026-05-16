// Icons Import
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"

// Image and Video Import
import Banner from "../assets/Images/banner.mp4"

// Component Imports
import Footer from "../components/common/Footer"
import ReviewSlider from "../components/common/ReviewSlider"
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from "../components/core/HomePage/CodeBlocks"
import HighlightText from "../components/core/HomePage/HighlightText"

import RecommendationSection from "../components/core/Recommendation/RecommendationSection"

function Home() {
  const { user } = useSelector((s) => s.profile)
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'
  const isInstructor = user?.accountType === "Instructor"
  const isAdmin = user?.accountType === "Admin"
  const hideExploreActions = isInstructor || (isAdmin && !isPreview)

  // Redirect admin to their own home page only if not in preview mode
  if (isAdmin && !isPreview) {
    return <Navigate to="/admin-home" replace />
  }
  return (
    <div className='pt-10'>
      {/* Section 1 */}
      <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-6 text-white">
        
        {/* Heading */}
        <div className="text-center text-4xl font-semibold">
          Empower Your Future with
          <HighlightText text={"Coding Skills"} />
        </div>

        {/* Sub Heading */}
        <div className="mt-3 w-[90%] text-center text-lg font-bold text-richblack-300">
          Whether you're a student eager to learn or an instructor ready to teach, our AI-powered online platform empowers you to learn and teach at your own pace, from anywhere in the world. Access a wealth of resources, including hands-on projects, quizzes, and personalized feedback.
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-row gap-7">
          <CTAButton active={true} linkto={"/about"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkto={"/contact"}>
            Book a Demo
          </CTAButton>
        </div>

        {/* Video */}
        <div className="mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video
            className="shadow-[20px_20px_rgba(255,255,255)]"
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Section 1 */}
        <CodeBlocks
          position={"lg:flex-row"}
          heading={
            <div className="text-4xl font-semibold">
              Unlock your
              <HighlightText text={"coding potential"} /> with our online
              courses.
            </div>
          }
          subheading={
            "Explore our expertly-designed courses taught by industry professionals. Whether you're a learner advancing your skills or an instructor sharing your expertise, our platform provides the tools you need to succeed."
          }
          ctabtn1={{
            btnText: "Try it Yourself",
            link: "/signup",
            active: true,
          }}
          ctabtn2={{
            btnText: "Learn More",
            link: "/about",
            active: false,
          }}
          codeColor={"text-yellow-25"}
          codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
          backgroundGradient={<div className="codeblock1 absolute"></div>}
        />

        {/* Code Section 2 — Hidden for instructors/admin */}
        {!hideExploreActions && (
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Start
                <HighlightText text={"coding in seconds"} />
              </div>
            }
            subheading={
              "Start your learning or teaching journey today. Our interactive hands-on environment means you'll gain practical experience from day one, whether you're coding as a student or creating content as an instructor."
            }
            ctabtn1={{
              btnText: "Explore Courses",
              link: "/catalog/computer-science-&-programming",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/about",
              active: false,
            }}
            codeColor={"text-white"}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        )}
      </div>

      {/* Section 3 */}
      <div className="relative mx-auto my-12 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-6 bg-richblack-900 text-white">
        
        {/* AI Recommendations — id used for scroll-to from footer/AI Features links */}
        {user?.accountType !== "Instructor" && (
          <div id="ai-recommendations" className="w-full scroll-mt-20">
            <RecommendationSection />
          </div>
        )}

        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

      <Footer />

      {/* Floating Back to Dashboard Button for Preview Mode */}
      {isPreview && user?.accountType === "Admin" && (
        <Link
          to="/admin"
          className="fixed bottom-6 right-6 bg-yellow-400 text-richblack-900 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-yellow-300 transition-colors z-50"
        >
          ← Back to Dashboard
        </Link>
      )}
    </div>
  )
}

export default Home
