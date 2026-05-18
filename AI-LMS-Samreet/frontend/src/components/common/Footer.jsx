import React from "react"
import { FooterLink2 } from "../../data/footer-links"
import { Link, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { openChat } from "/slices/chatSlice"
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa"

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"]

const Footer = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.profile)
  const location = useLocation()

  const isAdmin = user?.accountType === "Admin"
  const isInstructor = user?.accountType === "Instructor"
  const isStudent = user?.accountType === "Student"
  const isPreview = location.search.includes("preview=true")

  const appendPreview = (link) => {
    if (!isPreview || !link.startsWith("/")) return link
    return `${link}${link.includes("?") ? "&" : "?"}preview=true`
  }

  const filterLinks = (links) => {
    if (isAdmin || isInstructor) {
      return links.filter((l) => {
        if (l.title === "About Us" || l.title === "AI Features") return false
        if (l.title === "Browse Catalog" && isInstructor) return false
        return true
      })
    }
    return links
  }

  const companyLinks = [
    { title: "About Us", link: "/about" },
    { title: "AI Features", link: "/ai-features" },
    { title: "Contact Us", link: "/contact" },
  ]

  return (
    <div className="bg-richblack-800">
      <div className="relative mx-auto flex w-11/12 max-w-maxContent items-center justify-between gap-8 py-10 text-richblack-400 leading-6 lg:flex-row lg:py-14">
        <div className="flex w-full flex-col border-b border-richblack-700 pb-5 lg:flex-row">

          {/* Left: Branding + Company + Social */}
          <div className="mb-7 flex flex-col gap-4 pr-0 lg:w-[28%] lg:border-r lg:border-richblack-700 lg:pr-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-richblack-900 font-bold text-sm">E</div>
              <span className="text-richblack-5 font-bold text-lg">EduAI LMS</span>
            </div>
            <p className="text-sm text-richblack-400 leading-6">
              AI-powered learning platform designed to personalize education for every student. Built with love by Samreet Kaur.
            </p>
            <div>
              <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Company</h1>
              <div className="flex flex-col gap-2">
                {filterLinks(companyLinks).map((link, index) => (
                  <div key={index} className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                    <Link to={appendPreview(link.link)}>{link.title}</Link>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 text-lg mt-2">
              <FaFacebook className="cursor-pointer hover:text-richblack-50" />
              <FaGoogle className="cursor-pointer hover:text-richblack-50" />
              <FaTwitter className="cursor-pointer hover:text-richblack-50" />
              <FaYoutube className="cursor-pointer hover:text-richblack-50" />
            </div>
          </div>

          {/* Right: Conditional based on user role */}
          <div className="grid w-full grid-cols-1 gap-y-6 pl-0 sm:grid-cols-2 lg:w-[72%] lg:flex lg:flex-row lg:flex-wrap lg:pl-10">

            {isAdmin ? (
              <>
                {/* System Utility Column */}
                <div className="w-full lg:w-[30%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">System Utility</h1>
                  <div className="flex flex-col gap-2">
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/admin?tab=users">👥 User Management</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/admin?tab=courses">📚 Course Moderation</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/admin?tab=health">⚡ System Health</Link>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Actions */}
                <div className="w-full lg:w-[35%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Admin Quick Actions</h1>
                  <div className="flex flex-col gap-2">
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/?preview=true">🌐 View Public Site</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/admin/inquiries">📞 Support Inquiries</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/admin/docs">📖 Admin Documentation</Link>
                    </div>
                  </div>
                </div>

                {/* Technical Metadata */}
                <div className="w-full lg:w-[30%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">System Status</h1>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="text-richblack-400">
                      Build Version: <span className="text-richblack-300">v1.0.4</span>
                    </div>
                    <div className="text-richblack-400 flex items-center gap-2">
                      Database: <span className="text-green-400">Connected</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </>
            ) : isInstructor ? (
              <>
                {/* Instructor Resources */}
                <div className="w-full lg:w-[30%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Instructor Resources</h1>
                  <div className="flex flex-col gap-2">
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/instructor">📊 Instructor Dashboard</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/my-courses">📚 My Courses</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/add-course">➕ Create Course</Link>
                    </div>
                  </div>
                </div>

                {/* Teaching Actions */}
                <div className="w-full lg:w-[35%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Teaching Actions</h1>
                  <div className="flex flex-col gap-2">
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/my-courses">👥 Edit Courses</Link>
                    </div>
                    <div className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/settings">⚙️ Instructor Settings</Link>
                    </div>
                  </div>
                </div>

                {/* Instructor Support */}
                <div className="w-full lg:w-[30%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Instructor Support</h1>
                  <div className="flex flex-col gap-2 text-[14px]">
                    <div className="cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/contact">📞 Contact Support</Link>
                    </div>
                    <div className="cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/settings">🔒 Account Settings</Link>
                    </div>
                    <div className="cursor-pointer hover:text-richblack-50 transition-all duration-200">
                      <Link to="/dashboard/add-course">📄 Course Guidelines</Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Subjects */}
                <div className="w-full lg:w-[38%] pr-4 mb-7">
                  <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Subjects</h1>
                  <div className="flex flex-col gap-2">
                    {FooterLink2[0].links.map((link, index) => (
                      <div key={index} className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                        <Link to={appendPreview(link.link)}>{link.title}</Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links + AI Tools */}
                <div className="w-full lg:w-[58%] flex flex-col gap-8">

                  {/* Quick Links */}
                  <div>
                    <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Quick Links</h1>
                    <div className="flex flex-col gap-2">
                      {filterLinks(FooterLink2[1].links).map((link, index) => (
                        <div key={index} className="text-[14px] cursor-pointer hover:text-richblack-50 transition-all duration-200">
                          <Link to={appendPreview(link.link)}>{link.title}</Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Tools — sirf students ke liye */}
                  {isStudent && (
                    <div>
                      <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">AI Tools</h1>
                      <div className="flex flex-col gap-2">
                        <div
                          onClick={() => dispatch(openChat())}
                          className="text-[14px] cursor-pointer hover:text-yellow-400 transition-all duration-200"
                        >
                          💬 AI Chatbot Tutor
                        </div>
                        <div className="text-[14px] cursor-pointer hover:text-yellow-400 transition-all duration-200">
                          <Link to="/dashboard/my-quizzes">🎯 Take a Quiz</Link>
                        </div>
                        <div className="text-[14px] cursor-pointer hover:text-yellow-400 transition-all duration-200">
                          <Link to="/">🧠 Course Recommendations</Link>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto flex w-11/12 max-w-maxContent flex-row items-center justify-between pb-10 text-sm text-richblack-400 lg:pb-14">
        <div className="flex justify-between lg:items-start items-center flex-col lg:flex-row gap-3 w-full">
          <div className="flex flex-wrap justify-center">
            {BottomFooter.map((ele, i) => (
              <div
                key={i}
                className={`${
                  BottomFooter.length - 1 === i
                    ? ""
                    : "border-r border-richblack-700 cursor-pointer hover:text-richblack-50 transition-all duration-200"
                } px-3`}
              >
                <Link to={ele.split(" ").join("-").toLocaleLowerCase()}>{ele}</Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            Developed by{" "}
            <span className="text-yellow-400 font-semibold">Samreet Kaur</span>{" "}
            | Amritsar Group of Colleges © 2026 EduAI LMS
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
