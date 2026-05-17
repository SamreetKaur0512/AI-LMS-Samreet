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
    <div className="flex h-full flex-col py-10">
      <div className="flex flex-col">
        {sidebarLinks.map((link) => {
          if (link.type && user?.accountType !== link.type) return null
          return (
            <div key={link.id} onClick={() => setMobileOpen(false)}>
              <SidebarLink link={link} iconName={link.icon} />
            </div>
          )
        })}
      </div>
      <div className="mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700" />
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
          className="px-8 py-2 text-sm font-medium text-richblack-300"
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
      {/* Mobile hamburger button */}
      <button
        className="fixed top-[4.5rem] left-3 z-50 flex items-center justify-center rounded-full bg-richblack-800 border border-richblack-600 p-2 shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <MdClose size={22} className="text-white" /> : <HiMenuAlt1 size={22} className="text-white" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed top-[3.5rem] left-0 z-40 h-[calc(100vh-3.5rem)] w-[220px] transform bg-richblack-800 border-r border-richblack-700 transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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