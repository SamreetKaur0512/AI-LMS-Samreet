import React from "react"
import HighlightText from "../../../components/core/HomePage/HighlightText"
import CTAButton from "../../../components/core/HomePage/Button"

const LearningGridArray = [
  {
    order: -1,
    heading: "AI-Powered Learning for",
    highlightText: "Anyone, Anywhere",
    description:
      "EduAI LMS uses advanced AI to deliver personalized, adaptive learning experiences to students across India and beyond — making quality education accessible to all.",
    BtnText: "Explore Features",
    BtnLink: "/ai-features",
  },
  {
    order: 1,
    heading: "AI Chatbot Tutor",
    description:
      "Get instant answers to your questions 24/7 with our NLP-powered virtual tutor. It understands your queries, explains concepts clearly, and guides you through any topic — anytime.",
  },
  {
    order: 2,
    heading: "Smart Study Timetable",
    description:
      "Set your target completion date and daily study hours. Our AI tracks your real-time progress and tells you if you're on track, ahead, or falling behind — with personalized feedback.",
  },
  {
    order: 4,
    heading: "AI-Generated Quizzes",
    description:
      "Our platform auto-generates quizzes tailored to your enrolled courses — giving you instant, unbiased feedback on your understanding and helping you improve faster.",
  },
  {
    order: 5,
    heading: "Personalized Course Recommendations",
    description:
      "Our AI recommendation engine suggests the most relevant courses based on your interests, enrollment history, and learning goals — so you always know what to study next.",
  },
]

const LearningGrid = ({ showExploreButton = true, previewQuery = "" }) => {
  const exploreLink = `${LearningGridArray[0].BtnLink}${previewQuery}`
  return (
    <div className="mx-auto w-full max-w-maxContent mb-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">

        {/* Left hero block — spans 2 rows */}
        <div className="xl:row-span-2 flex flex-col gap-4 justify-center pb-10 xl:pb-0 xl:pr-8">
          <div className="text-4xl font-semibold text-white">
            {LearningGridArray[0].heading}
            <HighlightText text={LearningGridArray[0].highlightText} />
          </div>
          <p className="text-richblack-300 font-medium">
            {LearningGridArray[0].description}
          </p>
          {showExploreButton && (
            <div className="w-fit mt-2">
              <CTAButton active={true} linkto={exploreLink}>
                {LearningGridArray[0].BtnText}
              </CTAButton>
            </div>
          )}
        </div>

        {/* 4 feature boxes — 2×2 grid on the right */}
        {LearningGridArray.slice(1).map((card, i) => (
          <div
            key={i}
            className={`h-[220px] p-8 flex flex-col gap-5 ${
              i % 2 === 0 ? "bg-richblack-700" : "bg-richblack-800"
            }`}
          >
            <h1 className="text-richblack-5 text-lg font-semibold">{card.heading}</h1>
            <p className="text-richblack-300 font-medium text-sm leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}

      </div>
    </div>
  )
}

export default LearningGrid