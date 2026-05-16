import React, { useState } from "react" // Added useState
import { useSearchParams } from "react-router-dom"
import FoundingStory from "../assets/Images/FoundingStory.png"
import BannerImage1 from "../assets/Images/aboutus1.webp"
import BannerImage2 from "../assets/Images/aboutus2.webp"
import BannerImage3 from "../assets/Images/aboutus3.webp"
import { useSelector } from "react-redux"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import CTAButton from "../components/core/HomePage/Button"
import HighlightText from "../components/core/HomePage/HighlightText"
import ReviewSlider from "../components/common/ReviewSlider"
import Footer from "../components/common/Footer"

const About = () => {
  // Logic for the message sent response
  const [isSent, setIsSent] = useState(false);
  const { user } = useSelector((state) => state.profile)
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'
  const isInstructor = user?.accountType === "Instructor"
  const isAdmin = user?.accountType === "Admin"
  const showExploreButton = !user || user?.accountType === "Student" || (isAdmin && isPreview)

  const handleMessageSent = () => {
    setIsSent(true);
    // Hide message after 5 seconds
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="bg-richblack-900">
      {/* Section 1: Hero */}
      <section className="bg-richblack-700">
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center text-white">
          <header className="mx-auto py-20 text-4xl font-semibold lg:w-[70%]">
            Revolutionizing Education with
            <HighlightText text={"AI-Powered Learning"} />
            <p className="mx-auto mt-3 text-center text-base font-medium text-richblack-300 lg:w-[95%]">
              EduAI LMS is at the forefront of AI-driven personalized education. We use advanced AI, natural language processing, and predictive analytics to deliver smarter, more adaptive learning experiences for every student.
            </p>
          </header>
          <div className="sm:h-[70px] lg:h-[150px]"></div>
          <div className="absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
            <img src={BannerImage1} alt="Banner 1" />
            <img src={BannerImage2} alt="Banner 2" />
            <img src={BannerImage3} alt="Banner 3" />
          </div>
        </div>
      </section>

      {/* Section 2: Quote */}
      <section className="border-b border-richblack-700">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          <div className="h-[60px]"></div>
          <Quote />
        </div>
      </section>

      {/* Section 3: Story, Vision, Mission */}
      <section>
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-richblack-500">
          {/* Founding Story */}
          <div className="flex flex-col items-center gap-10 lg:flex-row justify-between">
            <div className="mt-16 mb-8 flex lg:w-[50%] flex-col gap-6">
              <h1 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]">
                Our Founding Story
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
              EduAI LMS was born out of a passion for bridging the gap between traditional learning and modern technology. As a Computer Science student, I recognized that while information is everywhere, personalized guidance is often missing. I envisioned a platform where AI doesn't just provide answers, but actively manages and enhances the learning journey for every student.
              </p>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                What started as a final year project at Amritsar Group of Colleges (AGC)
                evolved into a mission to create a smarter, more adaptive educational
                ecosystem. By combining the MERN stack with advanced AI capabilities, I
                built this platform to empower learners to take control of their time through intelligent automation and personalized feedback.
              </p>
            </div>
            <div>
              <img 
                src={FoundingStory} 
                alt="Founding Story" 
                className="shadow-[0_0_20px_0] shadow-[#FC6767]" 
              />
            </div>
          </div>

          {/* Vision and Mission */}
          <div className="flex flex-col items-center lg:gap-6 lg:flex-row justify-between mb-8">
            <div className="mt-6 flex lg:w-[45%] flex-col gap-6">
              <h1 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-4xl font-semibold text-transparent">
                Our Vision
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                To make quality, personalized education available to every student 
                regardless of location — where AI acts as a personal tutor, study 
                planner, and academic coach available 24/7, helping every learner 
                reach their full potential at their own pace.
              </p>
            </div>
            <div className="mt-6 flex lg:w-[45%] flex-col gap-6">
              <h1 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-4xl font-semibold">
                Our Mission
              </h1>
              <p className="text-base font-medium text-richblack-300 lg:w-[95%]">
                Our mission is to bridge the gap between traditional classroom 
                education and AI-powered learning. Through features like 
                the AI Chatbot, Smart Timetable, and AI Quiz Generator, we ensure 
                every student gets a genuinely personalized learning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.5: For Instructors */}
      {isInstructor && (
        <section className="bg-richblack-800 rounded-2xl my-16 mx-auto w-11/12 max-w-maxContent">
          <div className="px-8 py-12 md:px-16 md:py-16">
            <div className="flex flex-col items-center text-center gap-6">
              <h1 className="text-4xl font-semibold text-white">
                Welcome back, <HighlightText text={"Instructor"} />
              </h1>
              <p className="text-lg text-richblack-300 max-w-3xl">
                EduAI LMS makes it incredibly easy for instructors to create and share their expertise. With our intuitive course creation tools, you can upload your content, set up lessons, create quizzes, and manage your students — all in minutes. No complex setup required. Start teaching on our AI-powered platform today and reach students worldwide!
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton active={true} linkto="/dashboard/add-course">
                  Create Your First Course
                </CTAButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Stats */}
      <section className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white">
        <LearningGrid showExploreButton={showExploreButton} previewQuery={isPreview ? "?preview=true" : ""} />

        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 px-8 py-12 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <h1 className="text-center text-4xl font-semibold text-white">
            Get in <HighlightText text={"Touch"} />
          </h1>
          
          {/* SUCCESS RESPONSE MESSAGE */}
          {isSent ? (
             <div className="mt-4 text-center p-4 bg-caribbeangreen-200 text-caribbeangreen-900 rounded-lg font-bold animate-pulse">
                ✅ Message Sent Successfully!
             </div>
          ) : (
            <p className="text-center text-richblack-300 mt-3 text-sm">
              Have a question or feedback? We'd love to hear from you.
            </p>
          )}

          <div className="mt-10 mx-auto max-w-2xl">
            {/* Added callback to trigger the success message */}
            <ContactFormSection onSuccess={handleMessageSent} />
          </div>
        </div>
      </section>

      {/* Section 6: Reviews — Hidden for instructors */}
      {user?.accountType !== "Instructor" && (
        <div className="relative mx-auto my-16 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
          <div className="w-full rounded-2xl border border-richblack-700 bg-richblack-800 px-8 py-12">
            <h1 className="text-center text-4xl font-semibold text-white mb-8">
              Reviews from <HighlightText text={"Other Learners"} />
            </h1>
            <ReviewSlider />
          </div>
        </div>
      )}

      {/* Section 7: Developer Credit */}
      <section className="py-14">
        <div className="mx-auto w-11/12 max-w-maxContent text-center flex flex-col gap-4">
          <h3 className="text-3xl font-bold text-white">
            Project <HighlightText text={"Developer"} />
          </h3>
          <p className="text-richblack-300 text-sm">
            This AI-Based Learning Management System was designed and developed as a B.Tech final year project.
          </p>
          <div className="mt-4 inline-block mx-auto bg-richblack-800 rounded-2xl px-10 py-7 border border-richblack-600 shadow-[0_0_20px_rgba(250,204,21,0.08)]">
            <p className="text-2xl font-bold text-yellow-400">Samreet Kaur</p>
            <p className="text-richblack-300 text-sm">B.Tech CSE | Batch 2022–2026</p>
            <p className="text-richblack-300 text-sm">Amritsar Group of Colleges</p>
            <p className="text-richblack-300 text-sm mb-4">Department of Computer Science Engineering</p>
            
            <div className="border-t border-richblack-600 pt-4 mt-2">
              <a 
                href="https://www.linkedin.com/in/samreet-kaur-470189312" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-[#0077B5] hover:text-[#1FA2FF] transition-all duration-200 font-medium"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About