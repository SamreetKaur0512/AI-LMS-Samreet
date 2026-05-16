
const BASE_URL = "http://localhost:4000/api/v1"

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// CONTACT ADMIN API
export const contactUsEndpoints = {
  GET_ALL_CONTACTS_API: BASE_URL + "/reach/getAllContacts",
  UPDATE_CONTACT_STATUS_API: BASE_URL + "/reach/updateContactStatus",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}
  export const AI_CHAT_API = BASE_URL + "/ai/chat"
  export const RECOMMENDATION_API = BASE_URL + "/recommendation/personalized"
export const POPULAR_COURSES_API = BASE_URL + "/recommendation/popular"
export const QUIZ_ENDPOINTS = {
  GENERATE_QUIZ: BASE_URL + "/quiz/generate",
  GET_STUDENT_QUIZZES: BASE_URL + "/quiz/my-quizzes",
  GET_QUIZ_BY_COURSE: BASE_URL + "/quiz/course",
  SUBMIT_QUIZ: BASE_URL + "/quiz/submit",
  GET_QUIZ_HISTORY: BASE_URL + "/quiz/history",
}
export const TIMETABLE_ENDPOINTS = {
  GET_DASHBOARD: "http://localhost:4000/api/v1/timetable/dashboard",
  SAVE_PLAN:     "http://localhost:4000/api/v1/timetable/plan",
  DELETE_PLAN:   "http://localhost:4000/api/v1/timetable/plan",
}

export const ADMIN_ENDPOINTS = {
  SEED:                "http://localhost:4000/api/v1/admin/seed",
  OVERVIEW:            "http://localhost:4000/api/v1/admin/overview",
  GET_USERS:           "http://localhost:4000/api/v1/admin/users",
  GET_USER:            (id) => `http://localhost:4000/api/v1/admin/users/${id}`,
  UPDATE_USER:         (id) => `http://localhost:4000/api/v1/admin/users/${id}`,
  SUSPEND_USER:        (id) => `http://localhost:4000/api/v1/admin/users/${id}/suspend`,
  DELETE_USER:         (id) => `http://localhost:4000/api/v1/admin/users/${id}`,
  DELETE_USER_PHOTO:   (id) => `http://localhost:4000/api/v1/admin/users/${id}/photo`,
  DELETE_USER_BIO:     (id) => `http://localhost:4000/api/v1/admin/users/${id}/bio`,
  REMOVE_COURSE:       (id, cid) => `http://localhost:4000/api/v1/admin/users/${id}/courses/${cid}`,
  AI_ANALYTICS:        "http://localhost:4000/api/v1/admin/ai-analytics",
}
