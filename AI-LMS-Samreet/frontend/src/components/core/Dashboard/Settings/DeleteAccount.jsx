import { FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { deleteProfile } from "../../../../services/operations/SettingsAPI"
import { ACCOUNT_TYPE } from "../../../../utils/constants"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  async function handleDeleteAccount() {
    try {
      dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <div className="my-10 flex flex-row gap-x-5 rounded-md border-[1px] border-pink-700 bg-pink-900 p-8 px-12">
      <div className="flex aspect-square h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-pink-700">
        <FiTrash2 className="text-3xl text-pink-200" />
      </div>
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-semibold text-richblack-5">Delete Account</h2>

        {/* Instructor-specific warning */}
        {isInstructor && (
          <div className="rounded-md border border-yellow-500 bg-yellow-900/20 p-3 my-2">
            <p className="text-sm font-semibold text-yellow-50 mb-1">⚠️ Instructor Notice:</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-yellow-100">
              <li>Courses with <strong>enrolled students</strong> will <strong>remain accessible only to those enrolled students</strong> with your name shown as <strong>"Anonymous Instructor"</strong>. New students will not be able to find or enroll in them.</li>
              <li>Courses with <strong>no enrolled students</strong> will be permanently and fully deleted.</li>
              <li>All your other data (profile, reviews, images) will be permanently removed.</li>
            </ul>
          </div>
        )}

        {!isInstructor && (
          <div className="w-3/5 text-pink-25">
            <p>Would you like to delete your account?</p>
            <p>Deleting your account is permanent and will remove all data associated with it including your enrolled courses and progress.</p>
          </div>
        )}

        {!showConfirm ? (
          <button
            type="button"
            className="w-fit cursor-pointer italic text-pink-300"
            onClick={() => setShowConfirm(true)}
          >
            I want to delete my account.
          </button>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm text-pink-200 font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-md bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition-all"
              >
                Yes, Delete My Account
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-md bg-richblack-700 px-4 py-2 text-sm font-semibold text-richblack-100 hover:bg-richblack-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}