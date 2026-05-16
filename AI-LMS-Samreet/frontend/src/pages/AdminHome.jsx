import React from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../services/operations/authAPI"
import {
  FaUserShield, FaUsers, FaChartBar, FaRobot,
  FaBookOpen, FaSignOutAlt, FaArrowRight,
} from "react-icons/fa"
import Footer from "../components/common/Footer"
import HighlightText from "../components/core/HomePage/HighlightText"

const AdminHome = () => {
  const { user } = useSelector((s) => s.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const cards = [
    {
      icon: <FaChartBar size={32} className="text-yellow-400" />,
      title: "System Overview",
      desc: "View total enrollments, revenue, course completion rates and platform stats with visual charts.",
      link: "/admin?tab=overview",
      color: "border-yellow-500/30 hover:border-yellow-400",
    },
    {
      icon: <FaUsers size={32} className="text-blue-400" />,
      title: "User Management",
      desc: "View, edit, suspend or delete any student or instructor. Manage their courses, photos and bios.",
      link: "/admin?tab=users",
      color: "border-blue-500/30 hover:border-blue-400",
    },
    {
      icon: <FaRobot size={32} className="text-purple-400" />,
      title: "AI Analytics",
      desc: "Track AI usage across the platform — chatbot questions, timetable calls, tokens used and top topics.",
      link: "/admin?tab=ai",
      color: "border-purple-500/30 hover:border-purple-400",
    },
    {
      icon: <FaBookOpen size={32} className="text-green-400" />,
      title: "Course Catalog",
      desc: "Browse all published courses on the platform. View student enrollments and course details.",
      link: "/catalog/computer-science-&-programming",
      color: "border-green-500/30 hover:border-green-400",
    },
  ]

  return (
    <div className="min-h-screen bg-richblack-900 text-white">

      {/* Hero */}
      <section className="bg-richblack-800 border-b border-richblack-700 py-16">
        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-richblack-900">
              <FaUserShield size={30} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Welcome back, <HighlightText text={user?.firstName || "Admin"} />
              </h1>
              <p className="text-richblack-300 mt-1">
                EduAI LMS Administrator · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/admin"
              className="flex items-center gap-2 bg-yellow-400 text-richblack-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-all">
              <FaChartBar size={16} /> Open Admin Dashboard <FaArrowRight size={14} />
            </Link>
            <button
              onClick={() => dispatch(logout(navigate))}
              className="flex items-center gap-2 border border-richblack-600 text-richblack-300 px-6 py-3 rounded-xl hover:border-red-500 hover:text-red-400 transition-all">
              <FaSignOutAlt size={16} /> Logout
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="mx-auto w-11/12 max-w-maxContent py-14">
        <h2 className="text-2xl font-semibold text-white mb-8">
          Admin <HighlightText text={"Quick Access"} />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <Link key={i} to={card.link}
              className={`rounded-2xl bg-richblack-800 border p-6 flex flex-col gap-4 transition-all duration-200 ${card.color}`}>
              <div>{card.icon}</div>
              <h3 className="text-lg font-semibold text-richblack-5">{card.title}</h3>
              <p className="text-richblack-400 text-sm leading-relaxed">{card.desc}</p>
              <div className="mt-auto text-xs font-semibold text-yellow-400 flex items-center gap-1">
                Open <FaArrowRight size={10} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin Info */}
      <section className="mx-auto w-11/12 max-w-maxContent pb-14">
        <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-8 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName}`}
            alt="admin"
            className="h-20 w-20 rounded-full border-2 border-yellow-400 object-cover flex-shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-richblack-300 text-sm">{user?.email}</p>
            <p className="text-yellow-400 text-xs mt-1 font-semibold">● Platform Administrator</p>
          </div>
          <Link to="/admin"
            className="flex items-center gap-2 bg-richblack-700 border border-richblack-600 text-richblack-200 px-5 py-2.5 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition-all text-sm font-semibold flex-shrink-0">
            Go to Dashboard <FaArrowRight size={12} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AdminHome