import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { HiMenuAlt1 } from "react-icons/hi"
import { MdClose } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col pt-6 pb-6">
      {/* User info mini section */}
      {user && (
        <div className="flex items-center gap-3 px-5 pb-5 border-b border-richblack-700 mb-3">
          <img
            src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName}`}
            alt="profile"
            className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-yellow-500"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-richblack-5 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-richblack-400 truncate capitalize">
              {user?.accountType?.toLowerCase()}
            </p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <div className="flex flex-col flex-1">
        {sidebarLinks.map((link) => {
          if (link.type && user?.accountType !== link.type) return null
          return (
            <div key={link.id} onClick={() => setMobileOpen(false)}>
              <SidebarLink link={link} iconName={link.icon} />
            </div>
          )
        })}
      </div>

      <div className="mx-auto my-4 h-[1px] w-10/12 bg-richblack-700" />

      {/* Bottom: Settings + Logout */}
      <div className="flex flex-col">
        <div onClick={() => setMobileOpen(false)}>
          <SidebarLink
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettings"
          />
        </div>
        <button
          onClick={() => {
            setMobileOpen(false)
            setConfirmationModal({
              text1: "Are you sure?",
              text2: "You will be logged out of your account.",
              btn1Text: "Logout",
              btn2Text: "Cancel",
              btn1Handler: () => dispatch(logout(navigate)),
              btn2Handler: () => setConfirmationModal(null),
            })
          }}
          className="px-8 py-2 text-sm font-medium text-richblack-300 hover:text-richblack-100 hover:bg-richblack-700 transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-x-2">
            <VscSignOut className="text-lg" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger button - only shown when sidebar is closed */}
      {!mobileOpen && (
        <button
          className="fixed top-[4.2rem] left-3 z-50 flex items-center justify-center rounded-full bg-richblack-700 border border-richblack-500 p-2 shadow-lg md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <HiMenuAlt1 size={20} className="text-richblack-100" />
        </button>
      )}

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-[3.5rem] left-0 z-40 h-[calc(100vh-3.5rem)] w-[240px] transform bg-richblack-800 border-r border-richblack-700 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside sidebar at top-right */}
        <button
          className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-full bg-richblack-700 border border-richblack-500 p-1.5"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <MdClose size={18} className="text-richblack-100" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <SidebarContent />
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}