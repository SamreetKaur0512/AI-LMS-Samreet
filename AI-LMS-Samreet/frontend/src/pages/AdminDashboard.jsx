import React, { useEffect, useState, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { apiConnector } from "../services/apiconnector"
import { ADMIN_ENDPOINTS } from "../services/apis"
import {
  FaUsers, FaChartLine, FaRobot, FaUserShield,
  FaBookOpen, FaRupeeSign, FaBan, FaTrash, FaEdit, FaSearch,
  FaCheckCircle, FaTimesCircle, FaEye, FaTimes, FaSave,
  FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher,
  FaBrain, FaImage, FaFileAlt, FaMinusCircle,
  FaCalendarAlt,
} from "react-icons/fa"
import { logout } from "../services/operations/authAPI"

const COLORS = ["#facc15", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#fb923c"]

// ── small stat card ──────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color = "text-yellow-400" }) => (
  <div className="rounded-xl bg-richblack-800 border border-richblack-700 p-5 flex items-center gap-4">
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className="text-richblack-400 text-xs">{label}</p>
      <p className="text-white text-2xl font-bold">{value?.toLocaleString()}</p>
    </div>
  </div>
)

// ── User Detail Modal ────────────────────────────────────────────────────────
const UserModal = ({ userId, token, onClose, onRefresh }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector("GET", ADMIN_ENDPOINTS.GET_USER(userId), null, { Authorization: `Bearer ${token}` })
      if (res.data.success) { setUser(res.data.data); setForm({ firstName: res.data.data.firstName, lastName: res.data.data.lastName, email: res.data.data.email, accountType: res.data.data.accountType }) }
    } catch (e) { showToast("Failed to load user") }
    setLoading(false)
  }, [userId, token])

  useEffect(() => { fetchUser() }, [fetchUser])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const res = await apiConnector("PUT", ADMIN_ENDPOINTS.UPDATE_USER(userId), form, { Authorization: `Bearer ${token}` })
      if (res.data.success) { showToast("✅ User updated"); setEditMode(false); fetchUser(); onRefresh() }
    } catch (e) { showToast("❌ Update failed") }
    setSaving(false)
  }

  const handleSuspend = async () => {
    try {
      const res = await apiConnector("PUT", ADMIN_ENDPOINTS.SUSPEND_USER(userId), {}, { Authorization: `Bearer ${token}` })
      if (res.data.success) { showToast(res.data.message); fetchUser(); onRefresh() }
    } catch (e) { showToast("❌ Failed") }
  }

  const handleDeletePhoto = async () => {
    try {
      await apiConnector("DELETE", ADMIN_ENDPOINTS.DELETE_USER_PHOTO(userId), null, { Authorization: `Bearer ${token}` })
      showToast("🗑️ Photo removed"); fetchUser()
    } catch (e) { showToast("❌ Failed") }
  }

  const handleDeleteBio = async () => {
    try {
      await apiConnector("DELETE", ADMIN_ENDPOINTS.DELETE_USER_BIO(userId), null, { Authorization: `Bearer ${token}` })
      showToast("🗑️ Bio removed"); fetchUser()
    } catch (e) { showToast("❌ Failed") }
  }

  const handleRemoveCourse = async (courseId) => {
    try {
      await apiConnector("DELETE", ADMIN_ENDPOINTS.REMOVE_COURSE(userId, courseId), null, { Authorization: `Bearer ${token}` })
      showToast("✅ Course removed"); fetchUser(); onRefresh()
    } catch (e) { showToast("❌ Failed") }
  }

  const handleDeleteUser = async () => {
    try {
      await apiConnector("DELETE", ADMIN_ENDPOINTS.DELETE_USER(userId), null, { Authorization: `Bearer ${token}` })
      showToast("✅ User deleted"); onRefresh(); setTimeout(onClose, 1000)
    } catch (e) { showToast("❌ Failed") }
  }

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
    </div>
  )

  if (!user) return null
  const isStudent = user.accountType === "Student"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-richblack-800 border border-richblack-600 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-richblack-800 border-b border-richblack-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">User Details</h2>
          <div className="flex items-center gap-2">
            {toast && <span className="text-sm px-3 py-1 rounded-lg bg-richblack-700 text-richblack-200">{toast}</span>}
            <button onClick={onClose} className="text-richblack-400 hover:text-white"><FaTimes size={20} /></button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Profile row */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img src={user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName}`}
                alt="avatar" className="h-20 w-20 rounded-full object-cover border-2 border-richblack-600" />
              {user.isOnline && <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-richblack-800" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.accountType === "Student" ? "bg-blue-900 text-blue-300" : user.accountType === "Instructor" ? "bg-purple-900 text-purple-300" : "bg-yellow-900 text-yellow-300"}`}>{user.accountType}</span>
                {!user.active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300 font-semibold">Suspended</span>}
                {user.isOnline && <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-300 font-semibold">● Online</span>}
              </div>
              <p className="text-richblack-400 text-sm mt-0.5">{user.email}</p>
              <p className="text-richblack-500 text-xs mt-0.5">Joined: {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              {user.additionalDetails?.about && (
                <p className="text-richblack-300 text-sm mt-2 italic">"{user.additionalDetails.about}"</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-richblack-900 text-sm font-semibold hover:bg-yellow-300 transition-all">
              <FaEdit size={13} /> {editMode ? "Cancel Edit" : "Edit User"}
            </button>
            <button onClick={handleSuspend}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${user.active ? "bg-orange-900/40 border border-orange-600 text-orange-300 hover:bg-orange-900/70" : "bg-green-900/40 border border-green-600 text-green-300 hover:bg-green-900/70"}`}>
              {user.active ? <><FaBan size={13} /> Suspend Account</> : <><FaCheckCircle size={13} /> Activate Account</>}
            </button>
            {user.image && (
              <button onClick={handleDeletePhoto}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-300 text-sm hover:border-red-500 hover:text-red-400 transition-all">
                <FaImage size={13} /> Remove Photo
              </button>
            )}
            {user.additionalDetails?.about && (
              <button onClick={handleDeleteBio}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-300 text-sm hover:border-red-500 hover:text-red-400 transition-all">
                <FaFileAlt size={13} /> Clear Bio
              </button>
            )}
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm hover:bg-red-900/70 transition-all">
                <FaTrash size={13} /> Delete User
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xs font-semibold">Confirm delete?</span>
                <button onClick={handleDeleteUser} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg bg-richblack-700 text-richblack-300 text-xs hover:bg-richblack-600">Cancel</button>
              </div>
            )}
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="rounded-xl bg-richblack-700 border border-richblack-600 p-5">
              <h4 className="text-richblack-200 font-semibold mb-4 text-sm">Edit User Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[["First Name", "firstName"], ["Last Name", "lastName"], ["Email", "email"]].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-xs text-richblack-400 mb-1 block">{label}</label>
                    <input value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg bg-richblack-600 border border-richblack-500 px-3 py-2 text-white text-sm focus:border-yellow-400 outline-none" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-richblack-400 mb-1 block">Role</label>
                  <select value={form.accountType || ""} onChange={e => setForm(f => ({ ...f, accountType: e.target.value }))}
                    className="w-full rounded-lg bg-richblack-600 border border-richblack-500 px-3 py-2 text-white text-sm focus:border-yellow-400 outline-none">
                    <option value="Student">Student</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <button onClick={handleUpdate} disabled={saving}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-400 text-richblack-900 font-semibold text-sm hover:bg-yellow-300 disabled:opacity-60 transition-all">
                {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" /> : <FaSave size={13} />}
                Save Changes
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Gender", value: user.additionalDetails?.gender || "—" },
              { label: "Contact", value: user.additionalDetails?.contactNumber || "—" },
              { label: "DOB", value: user.additionalDetails?.dateOfBirth || "—" },
              { label: "Courses", value: user.courses?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-richblack-700 px-3 py-2 text-center">
                <p className="text-yellow-400 font-bold text-sm">{value}</p>
                <p className="text-richblack-400 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Courses Section */}
          {user.courses?.length > 0 && (
            <div>
              <h4 className="text-richblack-200 font-semibold mb-3 text-sm">
                {isStudent ? "Enrolled Courses" : "Courses Created"}
              </h4>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {user.courses.map(course => (
                  <div key={course._id} className="flex items-center gap-3 rounded-xl bg-richblack-700 border border-richblack-600 px-3 py-2">
                    <img src={course.thumbnail} alt="" className="h-10 w-14 rounded object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-richblack-100 text-sm font-medium truncate">{course.courseName}</p>
                      <p className="text-richblack-400 text-xs">₹{course.price} · {course.studentsEnrolled?.length || 0} enrolled · {course.status}</p>
                    </div>
                    {isStudent && (
                      <button onClick={() => handleRemoveCourse(course._id)}
                        className="flex-shrink-0 text-red-400 hover:text-red-300 transition-all p-1" title="Remove course">
                        <FaMinusCircle size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "overview",  label: "System Overview",   icon: <FaChartLine /> },
  { id: "users",     label: "User Management",   icon: <FaUsers /> },
  { id: "ai",        label: "AI Analytics",      icon: <FaRobot /> },
]

export default function AdminDashboard() {
  const { token, user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [tab, setTab] = useState("overview")
  const [searchParams, setSearchParams] = useSearchParams()

  // Read tab from URL on load and when URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab")
    if (urlTab && ["overview", "users", "ai"].includes(urlTab)) {
      setTab(urlTab)
    }
  }, [searchParams])

  const handleTabChange = (tabId) => {
    setTab(tabId)
    setSearchParams({ tab: tabId })
  }
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [userPages, setUserPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [aiData, setAiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [seeded, setSeeded] = useState(false)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector("GET", ADMIN_ENDPOINTS.OVERVIEW, null, { Authorization: `Bearer ${token}` })
      if (res.data.success) setOverview(res.data.data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }, [token])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ role: roleFilter, search, page: userPage, limit: 15 })
      const res = await apiConnector("GET", `${ADMIN_ENDPOINTS.GET_USERS}?${params}`, null, { Authorization: `Bearer ${token}` })
      if (res.data.success) { setUsers(res.data.data); setUserTotal(res.data.total); setUserPages(res.data.pages) }
    } catch (e) { console.log(e) }
    setLoading(false)
  }, [token, roleFilter, search, userPage])

  const fetchAI = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiConnector("GET", ADMIN_ENDPOINTS.AI_ANALYTICS, null, { Authorization: `Bearer ${token}` })
      if (res.data.success) setAiData(res.data.data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }, [token])

  useEffect(() => {
    if (tab === "overview") fetchOverview()
    else if (tab === "users") fetchUsers()
    else if (tab === "ai") fetchAI()
  }, [tab, fetchOverview, fetchUsers, fetchAI])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "users") fetchUsers() }, [roleFilter, search, userPage])

  // Redirect non-admins
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && user.accountType !== "Admin") navigate("/dashboard/my-profile")
  }, [user])

  const handleSeedAdmin = async () => {
    try {
      const res = await apiConnector("GET", ADMIN_ENDPOINTS.SEED, null)
      alert(res.data.message)
      setSeeded(true)
    } catch (e) { alert("Seed failed") }
  }

  return (
    <div className="min-h-screen bg-richblack-900 text-white">
      {/* Top Bar */}
      <div className="bg-richblack-800 border-b border-richblack-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-richblack-900">
            <FaUserShield size={18} />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">Admin Dashboard</p>
            <p className="text-richblack-400 text-xs">EduAI LMS Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-richblack-300 text-sm hidden sm:block">
            Logged in as <span className="text-yellow-400 font-semibold">{user?.firstName}</span>
          </span>
          <button onClick={() => dispatch(logout(navigate))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-300 text-sm hover:border-red-500 hover:text-red-400 transition-all">
            <FaSignOutAlt size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-richblack-800 border-b border-richblack-700 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${tab === t.id ? "border-yellow-400 text-yellow-400" : "border-transparent text-richblack-400 hover:text-richblack-200"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
          </div>
        )}

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {!loading && tab === "overview" && overview && (
          <div className="flex flex-col gap-8">
            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard icon={<FaUserGraduate />} label="Total Students"     value={overview.stats.totalStudents} color="text-blue-400" />
              <StatCard icon={<FaChalkboardTeacher />} label="Total Instructors" value={overview.stats.totalInstructors} color="text-purple-400" />
              <StatCard icon={<FaBookOpen />}    label="Total Courses"       value={overview.stats.totalCourses}   color="text-green-400" />
              <StatCard icon={<FaUsers />}       label="Total Enrollments"   value={overview.stats.totalEnrollments} color="text-yellow-400" />
              <StatCard icon={<FaRupeeSign />}   label="Est. Revenue (₹)"   value={overview.stats.totalRevenue}   color="text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard icon={<FaCheckCircle />} label="Published Courses"   value={overview.stats.publishedCourses} color="text-green-400" />
              <StatCard icon={<FaTimesCircle />} label="Draft Courses"       value={overview.stats.draftCourses}   color="text-orange-400" />
              <StatCard icon={<FaUsers />}       label="Active Users (7d)"   value={overview.stats.activeUsers}    color="text-teal-400" />
            </div>

            {/* Revenue & Enrollment Line Chart */}
            <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6">
              <h3 className="text-richblack-100 font-semibold mb-4">Revenue & Enrollments (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={overview.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="enrollments" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} name="Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Course Completion Bar Chart */}
            <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6">
              <h3 className="text-richblack-100 font-semibold mb-4">Course Completion Rates (Avg lessons completed)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={overview.courseCompletionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Bar dataKey="completion" fill="#34d399" radius={[0, 4, 4, 0]} name="Avg Completed Lessons" />
                  <Bar dataKey="enrolled" fill="#60a5fa" radius={[0, 4, 4, 0]} name="Enrolled Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── USERS TAB ────────────────────────────────────────── */}
        {!loading && tab === "users" && (
          <div className="flex flex-col gap-5">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-richblack-800 border border-richblack-700 px-3 py-2 w-full sm:w-72">
                <FaSearch size={13} className="text-richblack-400" />
                <input value={search} onChange={e => { setSearch(e.target.value); setUserPage(1) }}
                  placeholder="Search by name or email…"
                  className="bg-transparent text-sm text-white placeholder-richblack-400 outline-none flex-1" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "Student", "Instructor", "Admin"].map(r => (
                  <button key={r} onClick={() => { setRoleFilter(r); setUserPage(1) }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${roleFilter === r ? "bg-yellow-400 text-richblack-900" : "bg-richblack-800 border border-richblack-600 text-richblack-300 hover:border-yellow-400 hover:text-yellow-400"}`}>
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-richblack-400 text-xs">{userTotal} users found</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-richblack-700">
              <table className="w-full text-sm">
                <thead className="bg-richblack-700 text-richblack-300 text-xs uppercase">
                  <tr>
                    {["User", "Role", "Status", "Courses", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={`border-t border-richblack-700 ${i % 2 === 0 ? "bg-richblack-800" : "bg-richblack-850"} hover:bg-richblack-700 transition-all`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img src={u.image || `https://api.dicebear.com/5.x/initials/svg?seed=${u.firstName}`}
                              alt="" className="h-9 w-9 rounded-full object-cover" />
                            {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border border-richblack-800" />}
                          </div>
                          <div>
                            <p className="text-richblack-100 font-medium leading-none">{u.firstName} {u.lastName}</p>
                            <p className="text-richblack-400 text-xs mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.accountType === "Student" ? "bg-blue-900 text-blue-300" : u.accountType === "Instructor" ? "bg-purple-900 text-purple-300" : "bg-yellow-900 text-yellow-300"}`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                          {u.active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-richblack-300">{u.courses?.length || 0}</td>
                      <td className="px-4 py-3 text-richblack-400 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedUserId(u._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-300 text-xs hover:border-yellow-400 hover:text-yellow-400 transition-all">
                          <FaEye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-richblack-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                  className="px-4 py-2 rounded-lg bg-richblack-800 border border-richblack-600 text-richblack-300 text-xs disabled:opacity-40 hover:border-yellow-400 transition-all">← Prev</button>
                <span className="text-richblack-400 text-xs">Page {userPage} of {userPages}</span>
                <button onClick={() => setUserPage(p => Math.min(userPages, p + 1))} disabled={userPage === userPages}
                  className="px-4 py-2 rounded-lg bg-richblack-800 border border-richblack-600 text-richblack-300 text-xs disabled:opacity-40 hover:border-yellow-400 transition-all">Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ── AI ANALYTICS TAB ─────────────────────────────────── */}
        {!loading && tab === "ai" && aiData && (
          <div className="flex flex-col gap-8">
            {/* AI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={<FaRobot />}    label="Chatbot Questions"     value={aiData.featureBreakdown.find(f=>f.name==="chatbot")?.value || 0}  color="text-blue-400" />
              <StatCard icon={<FaCalendarAlt />} label="Timetable AI Calls"  value={aiData.featureBreakdown.find(f=>f.name==="timetable")?.value || 0} color="text-yellow-400" />
              <StatCard icon={<FaBrain />}    label="Total Tokens Used"      value={aiData.totalTokens}     color="text-purple-400" />
              <StatCard icon={<FaChartLine />} label="Avg Tokens/Call"       value={aiData.avgTokens}       color="text-green-400" />
            </div>

            {/* Daily Usage Line Chart */}
            <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6">
              <h3 className="text-richblack-100 font-semibold mb-4">Daily AI Interactions (Last 14 Days)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={aiData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} name="AI Interactions" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Topics Bar */}
              <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6">
                <h3 className="text-richblack-100 font-semibold mb-4">Most Asked Topics</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={aiData.topTopics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis dataKey="topic" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={100} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                      formatter={(value) => [value, "AI Interactions"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} name="AI Interactions">
                      {aiData.topTopics.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Feature Breakdown Pie */}
              <div className="rounded-2xl bg-richblack-800 border border-richblack-700 p-6">
                <h3 className="text-richblack-100 font-semibold mb-4">AI Feature Usage Breakdown</h3>
                {aiData.featureBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={aiData.featureBreakdown.map(f => ({
                          ...f,
                          name: f.name === "chatbot" ? "Chatbot Tutor"
                              : f.name === "timetable" ? "Smart Timetable"
                              : f.name === "quiz" ? "Quiz Generator"
                              : f.name,
                        }))}
                        cx="50%" cy="50%" outerRadius={90}
                        dataKey="value" nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#64748b" }}
                      >
                        {aiData.featureBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                        formatter={(value, name) => [value + " AI calls", name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-richblack-400 text-sm">No AI usage data yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No data state */}
        {!loading && tab === "ai" && !aiData && (
          <div className="text-center py-16 text-richblack-400">
            <FaRobot size={48} className="mx-auto mb-4 opacity-30" />
            <p>No AI analytics data yet. Students need to use the AI features first.</p>
          </div>
        )}

        {/* Seed admin helper (shown only if not yet seeded) */}
        {!seeded && tab === "overview" && !loading && (
          <div className="mt-6 rounded-xl bg-richblack-800 border border-dashed border-richblack-600 p-4 flex items-center justify-between gap-4">
            <p className="text-richblack-400 text-sm">First time? Click to create the admin account <strong className="text-yellow-400">admin@eduai.com</strong> / <strong className="text-yellow-400">Edu@2003</strong></p>
            <button onClick={handleSeedAdmin} className="px-4 py-2 rounded-lg bg-yellow-400 text-richblack-900 font-semibold text-sm hover:bg-yellow-300 transition-all flex-shrink-0">Create Admin</button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserModal userId={selectedUserId} token={token}
          onClose={() => setSelectedUserId(null)}
          onRefresh={fetchUsers} />
      )}
    </div>
  )
}
