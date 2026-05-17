import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  return (
    <button className="relative" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-1">
        {/* Fixed: proper circular crop for profile image */}
        <div className="h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full border border-richblack-600">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[118%] right-0 z-[1000] min-w-[140px] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border border-richblack-700 bg-richblack-800 shadow-xl"
          ref={ref}
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="flex w-full items-center gap-x-2 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25 whitespace-nowrap">
              <VscDashboard className="text-lg flex-shrink-0" />
              Dashboard
            </div>
          </Link>
          <div
            onClick={() => {
              dispatch(logout(navigate))
              setOpen(false)
            }}
            className="flex w-full items-center gap-x-2 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25 cursor-pointer whitespace-nowrap"
          >
            <VscSignOut className="text-lg flex-shrink-0" />
            Logout
          </div>
        </div>
      )}
    </button>
  )
}