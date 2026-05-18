import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import Footer from "../components/common/Footer"
import HighlightText from "../components/core/HomePage/HighlightText"
import { openChat } from "slices/chatSlice"
import { FaRobot, FaCalendarAlt, FaClipboardList, FaBookOpen, FaUserShield, FaChartBar } from "react-icons/fa"
import { Link } from "react-router-dom"

const features = [
  {
    icon: <FaRobot size={36} className="text-blue-400" />,
    title: "AI Chatbot Tutor",
    description:
      "A built-in AI-powered chatbot is available 24/7 to answer student questions, explain course concepts, and guide learners through topics they find difficult. Students can ask anything directly in the chat window — no need to wait for an instructor.",
    tech: "Gemini API · Natural Language Processing · Real-time Chat",
    actionLabel: "💬 Open AI Chatbot",
    actionType: "chat",
    highlight: true,
  },
  {
    icon: <FaCalendarAlt size={36} className="text-yellow-400" />,
    title: "Smart Study Timetable",
    description:
      "Students set a target completion date and planned study hours per day for each enrolled course. The system tracks their real lesson-by-lesson progress and calculates whether they are On Track, Ahead of Schedule, or Falling Behind — then uses AI to generate a personalized, encouraging message with specific advice.",
    tech: "Gemini API · Progress Tracking · MongoDB",
    actionLabel: "📅 View Smart Timetable",
    actionType: "link",
    actionTarget: "/dashboard/smart-timetable",
  },
  {
    icon: <FaClipboardList size={36} className="text-red-400" />,
    title: "AI Quiz Generator",
    description:
      "Students can generate a quiz for any of their enrolled courses with one click. The AI creates relevant multiple-choice questions based on the course content. Results are tracked, scored, and stored in the student's quiz history for review.",
    tech: "Gemini API · Auto-grading · Quiz History",
    actionLabel: "🎯 Take a Quiz",
    actionType: "link",
    actionTarget: "/dashboard/my-quizzes",
  },
  {
    icon: <FaBookOpen size={36} className="text-purple-400" />,
    title: "Personalized Course Recommendations",
    description:
      "The platform recommends courses to students based on their enrollment history, browsing patterns, and course popularity. The recommendation section on the home page shows tailored suggestions so students always know what to learn next.",
    tech: "Recommendation Engine · Course Catalog · Enrollment Data",
    actionLabel: "🧠 See Recommendations",
    actionType: "link",
    actionTarget: "/#ai-recommendations",
  },
  {
    icon: <FaChartBar size={36} className="text-green-400" />,
    title: "Admin AI Analytics Dashboard",
    description:
      "The admin panel includes a dedicated AI analytics section showing total questions asked across the platform, daily AI usage trends, which topics students ask about most, and a breakdown of which AI features (chatbot, quiz, timetable) are used most — all visualized with charts.",
    tech: "Recharts · AIUsageLog · Admin Dashboard",
    actionLabel: "📊 Admin Dashboard",
    actionType: "link",
    actionTarget: "/admin",
  },
  {
    icon: <FaUserShield size={36} className="text-pink-400" />,
    title: "Admin Control Panel",
    description:
      "A comprehensive admin dashboard lets the platform administrator view, edit, suspend, or delete any student or instructor account. The admin can also remove enrolled courses, clear profile photos or bios, view system-wide stats, and monitor revenue and enrollment trends in real time.",
    tech: "Role-based Access · User Management · System Overview",
    actionLabel: "🔐 Admin Panel",
    actionType: "link",
    actionTarget: "/admin",
  },
]

const AIFeatures = () => {
  const [active, setActive] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get("preview") === "true"
  const filteredFeatures = isPreview
    ? features.filter((feature) => feature.title !== "Personalized Course Recommendations")
    : features

  const handleAction = (feature) => {
    if (feature.actionType === "chat") {
      dispatch(openChat())
    } else {
      navigate(feature.actionTarget)
    }
  }

  return (
    <div className="bg-richblack-900 text-white min-h-screen">

      {/* Hero */}
      <section className="bg-richblack-800 py-20">
        <div className="mx-auto w-11/12 max-w-maxContent text-center flex flex-col gap-5">
          <h1 className="text-4xl font-bold">
            AI Features <HighlightText text={"Built Into This Platform"} />
          </h1>
          <p className="text-richblack-300 text-lg mx-auto max-w-2xl">
            Every AI feature listed here is actually built and working inside EduAI LMS —
            not concepts or plans. Click any feature to try it directly.
          </p>
          <p className="text-sm text-richblack-500 mt-1">
            Developed by{" "}
            <span className="text-yellow-300 font-semibold">Samreet Kaur (2233713)</span>
            {" "}· B.Tech CSE (2022–2026) · Amritsar Group of Colleges
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={() => dispatch(openChat())}
              className="flex items-center gap-2 bg-yellow-400 text-richblack-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 text-sm"
            >
              💬 Chat with AI Tutor
            </button>
            <Link
              to="/dashboard/my-quizzes"
              className="flex items-center gap-2 bg-richblack-600 border border-richblack-400 text-richblack-50 font-semibold px-6 py-3 rounded-lg hover:bg-richblack-500 transition-all duration-200 text-sm"
            >
              🎯 Take a Quiz
            </Link>
            {!isPreview && (
              <Link
                to="/#ai-recommendations"
                className="flex items-center gap-2 bg-richblack-600 border border-richblack-400 text-richblack-50 font-semibold px-6 py-3 rounded-lg hover:bg-richblack-500 transition-all duration-200 text-sm"
              >
                🧠 Course Recommendations
              </Link>
            )}
            <Link
              to="/dashboard/smart-timetable"
              className="flex items-center gap-2 bg-richblack-600 border border-richblack-400 text-richblack-50 font-semibold px-6 py-3 rounded-lg hover:bg-richblack-500 transition-all duration-200 text-sm"
            >
              📅 Smart Timetable
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto w-11/12 max-w-maxContent py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((f, i) => (
            <div
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`cursor-pointer rounded-xl p-6 flex flex-col gap-4 border transition-all duration-300 ${
                active === i
                  ? "bg-richblack-700 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)]"
                  : f.highlight
                  ? "bg-richblack-800 border-blue-500 hover:border-blue-400"
                  : "bg-richblack-800 border-richblack-600 hover:border-richblack-400"
              }`}
            >
              <div>{f.icon}</div>
              <h2 className="text-lg font-semibold text-richblack-5">{f.title}</h2>
              <p className={`text-richblack-300 text-sm leading-relaxed ${active === i ? "block" : "line-clamp-3"}`}>
                {f.description}
              </p>
              <div className="mt-auto pt-3 border-t border-richblack-600 flex flex-col gap-2">
                <p className="text-xs text-yellow-300 font-mono">{f.tech}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAction(f) }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all duration-200 text-left"
                >
                  {f.actionLabel} →
                </button>
              </div>
              <p className="text-xs text-richblack-500 text-right">
                {active === i ? "Click to collapse ▲" : "Click to expand ▼"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works — simple honest table */}
      <section className="mx-auto w-11/12 max-w-maxContent pb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          How Each Feature <HighlightText text={"Actually Works"} />
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-richblack-700 text-richblack-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Feature</th>
                <th className="px-6 py-4">What Student Does</th>
                <th className="px-6 py-4">What AI Does</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AI Chatbot",        "Types a question in the chat window",              "Gemini API generates a helpful, contextual answer instantly"],
                ["Smart Timetable",   "Sets target date + daily hours for a course",      "Tracks lesson progress, calculates status, writes personalized advice"],
                ["Quiz Generator",    "Picks an enrolled course and clicks Generate",     "Gemini creates MCQ questions, auto-grades answers, saves score"],
                ["Recommendations",  "Visits home page or recommendation section",        "Shows courses based on enrollment patterns and popularity"],
                ["AI Analytics",     "Admin views the AI Analytics tab",                 "Charts show daily usage, top topics, feature breakdown"],
              ].map(([feature, student, ai], i) => (
                <tr key={i} className={`${i % 2 === 0 ? "bg-richblack-800" : "bg-richblack-850"} border-b border-richblack-700`}>
                  <td className="px-6 py-4 font-medium text-yellow-300">{feature}</td>
                  <td className="px-6 py-4 text-richblack-300">{student}</td>
                  <td className="px-6 py-4 text-richblack-400">{ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AIFeatures
