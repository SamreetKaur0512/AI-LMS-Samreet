import { useEffect, useState } from "react"
import { AiOutlineClose, AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation, useSearchParams } from "react-router-dom"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories, catalogData } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [subLinks, setSubLinks] = useState([])
  const [popularCourses, setPopularCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isPreview = searchParams.get('preview') === 'true'
  const isAdmin = user?.accountType === ACCOUNT_TYPE.ADMIN && !isPreview
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
        
        const popularRes = await apiConnector("GET", catalogData.POPULAR_COURSES_API)
        setPopularCourses(popularRes.data.data.slice(0, 4)) // limit to 4
      } catch (error) {
        console.log("Could not fetch Categories or Popular Courses.", error)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, location.search])

  const matchRoute = (route) => matchPath({ path: route }, location.pathname)

  const appendPreviewQuery = (path) => {
    if (!isPreview) return path
    return path.includes("?") ? `${path}&preview=true` : `${path}?preview=true`
  }

  const showPopularCourses = !isPreview && user?.accountType !== ACCOUNT_TYPE.STUDENT

  return (
    <div className={`sticky top-0 z-50 flex min-h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${location.pathname !== "/" ? "bg-richblack-800" : "bg-richblack-900/95"} transition-all duration-200`}>
      <div className="relative flex w-11/12 max-w-maxContent items-center justify-between py-2">

        {/* Logo */}
        <Link to={appendPreviewQuery("/")} className="flex min-w-0 flex-col items-start justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-25 to-yellow-100 bg-clip-text text-transparent sm:text-3xl">
            EduAI LMS
          </h1>
          <p className="max-w-[190px] truncate text-[10px] italic tracking-widest text-richblack-300 sm:max-w-none sm:text-xs">
            AI-based Learning Management System
          </p>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {isAdmin ? (
              // ── Admin nav links ──────────────────────────────────────
              <>
                <li>
                  <Link to="/">
                    <p className={matchRoute("/") ? "text-yellow-25" : "text-richblack-25"}>Home</p>
                  </Link>
                </li>
                <li>
                  <Link to="/admin?tab=overview">
                    <p className={matchRoute("/admin") ? "text-yellow-25" : "text-richblack-25"}>Dashboard</p>
                  </Link>
                </li>
                <li>
                  <Link to="/admin?tab=users">
                    <p className="text-richblack-25 hover:text-yellow-25 transition-all cursor-pointer">User Management</p>
                  </Link>
                </li>
                <li>
                  <Link to="/admin?tab=ai">
                    <p className="text-richblack-25 hover:text-yellow-25 transition-all cursor-pointer">AI Analytics</p>
                  </Link>
                </li>
                <li>
                  <Link to={appendPreviewQuery("/contact")}>
                    <p className={matchRoute("/contact") ? "text-yellow-25" : "text-richblack-25"}>Contact</p>
                  </Link>
                </li>
              </>
            ) : isInstructor ? (
              // ── Instructor nav links ──────────────────────────────────
              <>
                <li>
                  <Link to="/">
                    <p className={matchRoute("/") ? "text-yellow-25" : "text-richblack-25"}>Home</p>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/instructor">
                    <p className={matchRoute("/dashboard/instructor") ? "text-yellow-25" : "text-richblack-25"}>Dashboard</p>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/my-courses">
                    <p className={matchRoute("/dashboard/my-courses") ? "text-yellow-25" : "text-richblack-25"}>My Courses</p>
                  </Link>
                </li>
                <li>
                  <Link to={appendPreviewQuery("/about")}>
                    <p className={matchRoute("/about") ? "text-yellow-25" : "text-richblack-25"}>About Us</p>
                  </Link>
                </li>
                <li>
                  <Link to={appendPreviewQuery("/contact")}>
                    <p className={matchRoute("/contact") ? "text-yellow-25" : "text-richblack-25"}>Contact Us</p>
                  </Link>
                </li>
              </>
            ) : (
              // ── Student nav links ────────────────────────────────────
              NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div className={`group relative flex cursor-pointer items-center gap-1 ${matchRoute("/catalog/:catalogName") ? "text-yellow-25" : "text-richblack-25"}`}>
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[300px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : (
                          <>
                            {/* Categories */}
                            <div className="mb-2">
                              <p className="text-sm font-semibold text-richblack-900 mb-2">Categories</p>
                              {subLinks?.length ? (
                                subLinks.filter((s) => s?.courses?.length > 0).map((subLink, i) => (
                                  <Link
                                    to={appendPreviewQuery(`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`)}
                                    className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50 block text-sm"
                                    key={i}
                                  >
                                    <p>{subLink.name}</p>
                                  </Link>
                                ))
                              ) : (
                                <p className="text-center text-sm">No Categories Found</p>
                              )}
                            </div>
                            {/* Frequently Bought Courses - only for non-students */}
                            {showPopularCourses && (
                              <div className="border-t border-richblack-300 pt-2">
                                <p className="text-sm font-semibold text-richblack-900 mb-2">Frequently Bought</p>
                                {popularCourses?.length ? (
                                  popularCourses.map((course, i) => (
                                    <Link
                                      to={appendPreviewQuery(`/course/${course._id}`)}
                                      className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50 block text-sm"
                                      key={i}
                                    >
                                      <p>{course.courseName}</p>
                                    </Link>
                                  ))
                                ) : (
                                  <p className="text-center text-sm">No Courses Found</p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link to={appendPreviewQuery(link?.path)}>
                      <p className={matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}>
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* Right side actions */}
        <div className="hidden items-center gap-x-4 md:flex">
          {/* Cart — only for students */}
          {user && !isAdmin && !isPreview && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Login / Signup for guests */}
          {!token && (
            <>
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Sign up
                </button>
              </Link>
            </>
          )}

          
{token && isAdmin && !matchRoute("/admin") && (
  <Link to="/admin">
    <button className="rounded-[8px] border border-yellow-500 bg-yellow-400 px-[12px] py-[8px] text-richblack-900 font-semibold text-sm hover:bg-yellow-300 transition-all">
      Admin Panel
    </button>
  </Link>
)}

          {/* Go back to Admin site while in preview mode */}
          {token && isPreview && user?.accountType === ACCOUNT_TYPE.ADMIN && (
            <Link to="/admin">
              <button className="rounded-[8px] border border-yellow-500 bg-yellow-400 px-[12px] py-[8px] text-richblack-900 font-semibold text-sm hover:bg-yellow-300 transition-all">
                Go back to Admin site
              </button>
            </Link>
          )}

          {/* Profile dropdown */}
          {token && <ProfileDropdown />}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-richblack-700 bg-richblack-800 md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <AiOutlineClose fontSize={22} fill="#AFB2BF" />
          ) : (
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          )}
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-[calc(100vh-4.5rem)] overflow-y-auto rounded-lg border border-richblack-700 bg-richblack-800 p-4 shadow-2xl md:hidden">
            <div className="flex flex-col gap-1 text-richblack-25">
              {isAdmin ? (
                <>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/">Home</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/admin?tab=overview">Dashboard</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/admin?tab=users">User Management</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/admin?tab=ai">AI Analytics</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to={appendPreviewQuery("/contact")}>Contact</Link>
                </>
              ) : isInstructor ? (
                <>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/">Home</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/dashboard/instructor">Dashboard</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to="/dashboard/my-courses">My Courses</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to={appendPreviewQuery("/about")}>About Us</Link>
                  <Link className="rounded-md px-3 py-3 hover:bg-richblack-700" to={appendPreviewQuery("/contact")}>Contact Us</Link>
                </>
              ) : (
                <>
                  {NavbarLinks.filter((link) => link.title !== "Catalog").map((link) => (
                    <Link
                      key={link.title}
                      className="rounded-md px-3 py-3 hover:bg-richblack-700"
                      to={appendPreviewQuery(link.path)}
                    >
                      {link.title}
                    </Link>
                  ))}
                  <div className="mt-2 border-t border-richblack-700 pt-3">
                    <p className="px-3 pb-2 text-sm font-semibold text-richblack-300">Catalog</p>
                    {loading ? (
                      <p className="px-3 py-2 text-sm text-richblack-400">Loading...</p>
                    ) : subLinks?.filter((s) => s?.courses?.length > 0).length ? (
                      subLinks
                        .filter((s) => s?.courses?.length > 0)
                        .map((subLink, i) => (
                          <Link
                            to={appendPreviewQuery(`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`)}
                            className="block rounded-md px-3 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
                            key={i}
                          >
                            {subLink.name}
                          </Link>
                        ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-richblack-400">No Categories Found</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-richblack-700 pt-4">
              {user && !isAdmin && !isPreview && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link to="/dashboard/cart" className="flex items-center justify-between rounded-md border border-richblack-700 px-3 py-3 text-richblack-100">
                  <span>Cart</span>
                  <span className="rounded-full bg-richblack-600 px-2 py-0.5 text-xs font-bold text-yellow-100">{totalItems}</span>
                </Link>
              )}

              {!token && (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="rounded-md border border-richblack-700 bg-richblack-900 px-3 py-3 text-center text-richblack-100">
                    Log in
                  </Link>
                  <Link to="/signup" className="rounded-md border border-richblack-700 bg-yellow-50 px-3 py-3 text-center font-semibold text-richblack-900">
                    Sign up
                  </Link>
                </div>
              )}

              {token && isAdmin && !matchRoute("/admin") && (
                <Link to="/admin" className="rounded-md bg-yellow-400 px-3 py-3 text-center font-semibold text-richblack-900">
                  Admin Panel
                </Link>
              )}

              {token && isPreview && user?.accountType === ACCOUNT_TYPE.ADMIN && (
                <Link to="/admin" className="rounded-md bg-yellow-400 px-3 py-3 text-center font-semibold text-richblack-900">
                  Go back to Admin site
                </Link>
              )}

              {token && <div className="self-start"><ProfileDropdown /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
