import { RiEditBoxLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()

  return (
    <div className="w-full px-2 sm:px-0">
      <h1 className="mb-8 text-2xl sm:text-3xl font-medium text-richblack-5">
        My Profile
      </h1>

      {/* ── Profile Card ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border border-richblack-700 bg-richblack-800 p-6 sm:p-8">
        <div className="flex items-center gap-x-4">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="h-[72px] w-[72px] flex-shrink-0 rounded-full object-cover object-center border-2 border-richblack-600"
          />
          <div className="space-y-1 min-w-0">
            <p className="text-base sm:text-lg font-semibold text-richblack-5 break-words">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-xs sm:text-sm text-richblack-300 break-all">
              {user?.email}
            </p>
          </div>
        </div>
        <IconBtn
          text="Edit"
          onclick={() => navigate("/dashboard/settings")}
          customClasses="self-start sm:self-auto"
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      {/* ── About ────────────────────────────────────── */}
      <div className="my-6 flex flex-col gap-y-6 rounded-md border border-richblack-700 bg-richblack-800 p-6 sm:p-8">
        <div className="flex w-full items-center justify-between">
          <p className="text-base sm:text-lg font-semibold text-richblack-5">About</p>
          <IconBtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>
        <p
          className={`${
            user?.additionalDetails?.about
              ? "text-richblack-5"
              : "text-richblack-400"
          } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>

      {/* ── Personal Details ─────────────────────────── */}
      <div className="my-6 flex flex-col gap-y-6 rounded-md border border-richblack-700 bg-richblack-800 p-6 sm:p-8">
        <div className="flex w-full items-center justify-between">
          <p className="text-base sm:text-lg font-semibold text-richblack-5">
            Personal Details
          </p>
          <IconBtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        {/* Grid of detail fields - stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className="mb-1 text-xs text-richblack-600">First Name</p>
            <p className="text-sm font-medium text-richblack-5">{user?.firstName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-richblack-600">Last Name</p>
            <p className="text-sm font-medium text-richblack-5">{user?.lastName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-richblack-600">Email</p>
            <p className="text-sm font-medium text-richblack-5 break-all">{user?.email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-richblack-600">Phone Number</p>
            <p className="text-sm font-medium text-richblack-5">
              {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-richblack-600">Gender</p>
            <p className="text-sm font-medium text-richblack-5">
              {user?.additionalDetails?.gender ?? "Add Gender"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-richblack-600">Date Of Birth</p>
            <p className="text-sm font-medium text-richblack-5">
              {formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Add Date Of Birth"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}