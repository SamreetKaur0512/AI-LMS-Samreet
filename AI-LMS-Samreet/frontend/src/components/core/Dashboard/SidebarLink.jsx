import * as VscIcons from "react-icons/vsc"
import * as FaIcons from "react-icons/fa"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "slices/courseSlice"

export default function SidebarLink({ link, iconName }) {
  // Support both VSC and FA icon libraries
  const Icon = VscIcons[iconName] || FaIcons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative shrink-0 px-5 py-2 text-sm font-medium md:px-8 ${
        matchRoute(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      } transition-all duration-200`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <div className="flex items-center gap-x-2">
        {Icon ? <Icon className="text-lg flex-shrink-0" /> : <div className="w-[18px]"></div>}
        <span>{link.name}</span>
      </div>
    </NavLink>
  )
}