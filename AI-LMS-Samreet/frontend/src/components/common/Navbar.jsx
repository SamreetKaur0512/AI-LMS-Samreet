import { useEffect, useRef, useState } from "react"
import { AiOutlineMenu, AiOutlineClose, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation, useNavigate, useSearchParams } from "react-router-dom"
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
  const mobileMenuRef = useRef(null)

  const isPreview = searchParams.get("preview") === "true"
  const isAdmin = user?.accountType === ACCOUNT_TYPE.ADMIN && !isPreview
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
        const popularRes = await apiConnector("GET", catalogData.POPULAR_COURSES_API)
        setPopularCourses(popularRes.data.data.slice(0, 4))
      } catch (error) {
        console.log("Could not fetch Categories or Popular Courses.", error)
      }
      setLoading(false)
    })()
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const matchRoute = (route) => matchPath({ path: route }, location.pathname)

  const appendPreviewQuery = (path) => {
    if (!isPreview) return path
    return path.includes("?") ? `${path}&preview=true` : `${path}?preview=true`
  }

  const showPopularCourses = !isPreview && user?.accountType !== ACCOUNT_TYPE.STUDENT

  // Build nav links array for reuse in both desktop + mobile
  const renderNavLinks = (onLinkClick = () => {}) => {
    if (isAdmin) {
      return (
        <>
          <NavItem to="/" label="Home" matchRoute={matchRoute} onClick={onLinkClick} />
          <NavItem to="/admin?tab=overview" label="Dashboard" matchRoute={matchRoute} path="/admin" onClick={onLinkClick} />
          <NavItem to="/admin?tab=users" label="User Management" matchRoute={matchRoute} path="/admin" onClick={onLinkClick} />
          <NavItem to="/admin?tab=ai" label="AI Analytics" matchRoute={matchRoute} path="/admin" onClick={onLinkClick} />
          <NavItem to={appendPreviewQuery("/contact")} label="Contact" matchRoute={matchRoute} path="/contact" onClick={onLinkClick} />
        </>
      )
    }
    if (isInstructor) {
      return (
        <>
          <NavItem to="/" label="Home" matchRoute={matchRoute} onClick={onLinkClick} />
          <NavItem to="/dashboard/instructor" label="Dashboard" matchRoute={matchRoute} onClick={onLinkClick} />
          <NavItem to="/dashboard/my-courses" label="My Courses" matchRoute={matchRoute} onClick={onLinkClick} />
          <NavItem to={appendPreviewQuery("/about")} label="About Us" matchRoute={matchRoute} path="/about" onClick={onLinkClick} />
          <NavItem to={appendPreviewQuery("/contact")} label="Contact Us" matchRoute={matchRoute} path="/contact" onClick={onLinkClick} />
        </>
      )
    }
    return NavbarLinks.map((link, index) => (
      <li key={index} onClick={onLinkClick} className="px-4 py-2.5 hover:bg-richblack-700 transition-all">
        {link.title === "Catalog" ? (
          <div className={`group relative flex cursor-pointer items-center gap-1 ${matchRoute("/catalog/:catalogName") ? "text-yellow-25" : "text-richblack-25"}`}>
            <p>{link.title}</p>
            <BsChevronDown />
            <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[280px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100">
              <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
              {loading ? (
                <p className="text-center text-sm">Loading...</p>
              ) : (
                <>
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-richblack-900 mb-2">Categories</p>
                    {subLinks?.length ? (
                      subLinks.filter((s) => s?.courses?.length > 0).map((subLink, i) => (
                        <Link
                          to={appendPreviewQuery(`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`)}
                          className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50 block text-sm"
                          key={i}
                        >
                          {subLink.name}
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-sm">No Categories Found</p>
                    )}
                  </div>
                  {showPopularCourses && popularCourses?.length > 0 && (
                    <div className="border-t border-richblack-300 pt-2">
                      <p className="text-sm font-semibold text-richblack-900 mb-2">Frequently Bought</p>
                      {popularCourses.map((course, i) => (
                        <Link
                          to={appendPreviewQuery(`/course/${course._id}`)}
                          className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50 block text-sm"
                          key={i}
                        >
                          {course.courseName}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <Link to={appendPreviewQuery(link?.path)}>
            <p className={matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}>{link.title}</p>
          </Link>
        )}
      </li>
    ))
  }

  return (
    <>
      <div
        className={`flex h-14 items-center justify-center border-b border-richblack-700 ${
          location.pathname !== "/" ? "bg-richblack-800" : ""
        } transition-all duration-200 relative z-40`}
      >
        <div className="flex w-11/12 max-w-maxContent items-center justify-between">

          {/* Logo */}
          <Link to={appendPreviewQuery("/")} className="flex flex-col items-start justify-center">
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-25 to-yellow-100 bg-clip-text text-transparent leading-tight">
              EduAI LMS
            </h1>
            <p className="hidden sm:block text-xs text-richblack-300 italic tracking-widest">
              AI-based Learning Management System
            </p>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:block">
            <ul className="flex gap-x-6 text-richblack-25">
              {renderNavLinks()}
            </ul>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-x-4 md:flex">
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
            {token && isPreview && user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <Link to="/admin">
                <button className="rounded-[8px] border border-yellow-500 bg-yellow-400 px-[12px] py-[8px] text-richblack-900 font-semibold text-sm hover:bg-yellow-300 transition-all">
                  Go back to Admin site
                </button>
              </Link>
            )}
            {token && <ProfileDropdown />}
          </div>

          {/* Mobile Right: cart + profile + hamburger */}
          <div className="flex items-center gap-x-3 md:hidden">
            {user && !isAdmin && !isPreview && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-4 w-4 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-[10px] font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token && (
              <div className="flex-shrink-0">
                <ProfileDropdown />
              </div>
            )}
            {!token && (
              <div className="flex gap-2">
                <Link to="/login">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[8px] py-[5px] text-xs text-richblack-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[8px] py-[5px] text-xs text-richblack-100">
                    Sign up
                  </button>
                </Link>
              </div>
            )}
            {/* Hamburger button — always last, never overlaps profile */}
            <button
              className="flex flex-shrink-0 items-center justify-center rounded-md p-1.5 text-richblack-100 hover:bg-richblack-700 transition-all"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <AiOutlineClose size={22} /> : <AiOutlineMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            className="fixed top-14 left-0 right-0 z-40 bg-richblack-800 border-b border-richblack-700 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col py-3">
              <ul className="flex flex-col text-richblack-25 text-sm">
                {renderNavLinks(() => setMobileMenuOpen(false))}
              </ul>
              {/* Admin panel button in mobile menu */}
              {token && isAdmin && !matchRoute("/admin") && (
                <div className="px-4 pt-3 border-t border-richblack-700 mt-2">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-[8px] border border-yellow-500 bg-yellow-400 px-[12px] py-[8px] text-richblack-900 font-semibold text-sm">
                      Admin Panel
                    </button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

// Small helper component for nav items
function NavItem({ to, label, matchRoute, path, onClick }) {
  const resolvedPath = path || to.split("?")[0]
  return (
    <li onClick={onClick} className="px-4 py-2.5 hover:bg-richblack-700 transition-all">
      <Link to={to}>
        <p className={matchRoute(resolvedPath) ? "text-yellow-25 font-medium" : "text-richblack-25"}>
          {label}
        </p>
      </Link>
    </li>
  )
}

export default Navbar
