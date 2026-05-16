import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import { getCatalogaPageData } from '../services/operations/pageAndComponentData';
import Course_Card from '../components/core/Catalog/Course_Card';
import CourseSlider from '../components/core/Catalog/CourseSlider';
import { useSelector } from "react-redux"
import Error from "./Error"
import { ACCOUNT_TYPE } from '../utils/constants'

const Catalog = () => {

    const { loading } = useSelector((state) => state.profile)
    const { user } = useSelector((state) => state.profile)
    const { catalogName } = useParams()
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const isAdmin = user?.accountType === ACCOUNT_TYPE.ADMIN

    //Fetch all categories
    useEffect(()=> {
        const getCategories = async() => {
            const res = await apiConnector("GET", categories.CATEGORIES_API);
            const category_id = 
            res?.data?.data?.filter((ct) => ct?.name?.split(" ").join("-").toLowerCase() === catalogName)[0]._id;
            setCategoryId(category_id);
        }
        getCategories();
    },[catalogName]);

    useEffect(() => {
        const getCategoryDetails = async() => {
            try{
                const res = await getCatalogaPageData(categoryId);
                setCatalogPageData(res);
            }
            catch(error) {
                console.log(error)
            }
        }
        if(categoryId) {
            getCategoryDetails();
        }
    },[categoryId]);

    if (loading || !catalogPageData) {
        return (
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        )
      }
      if (!loading && !catalogPageData.success) {
        return <Error />
      }

      const differentCourses = catalogPageData?.data?.differentCategory?.courses
      const differentCategoryName = catalogPageData?.data?.differentCategory?.name
      const selectedCategoryCourses = catalogPageData?.data?.selectedCategory?.courses
      const hasNoCourses = selectedCategoryCourses?.length === 0
    
      return (
        <>
          {/* Hero Section */}
          <div className="box-content bg-richblack-800 px-4">
            <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
              <p className="text-sm text-richblack-300">
                {`Home / Catalog / `}
                <span className="text-yellow-25">
                  {catalogPageData?.data?.selectedCategory?.name}
                </span>
              </p>
              <p className="text-3xl text-richblack-5">
                {catalogPageData?.data?.selectedCategory?.name}
              </p>
              <p className="max-w-[870px] text-richblack-200">
                {catalogPageData?.data?.selectedCategory?.description}
              </p>
              {/* Admin badge */}
              {isAdmin && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 text-sm text-yellow-400">
                  🔐 Admin View — You are browsing as Administrator
                </div>
              )}
            </div>
          </div>

          {/* No Courses Message */}
          {hasNoCourses && (
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-richblack-700 p-8 text-center">
                <div className="text-5xl">📚</div>
                <h2 className="text-2xl font-semibold text-richblack-25">
                  No Courses Available Yet
                </h2>
                <p className="text-lg text-richblack-300">
                  We're working hard to bring you amazing courses in {catalogPageData?.data?.selectedCategory?.name}. Check back soon!
                </p>
                <p className="text-sm text-richblack-400">
                  In the meantime, explore other subjects or browse our frequently bought courses below.
                </p>
              </div>
            </div>
          )}

          {/* Section 1 — Courses to get you started */}
          {!isAdmin && !hasNoCourses && (
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
              <div className="section_heading">Courses to get you started</div>
              <div className="my-4 flex border-b border-b-richblack-600 text-sm">
                <p
                  className={`px-4 py-2 ${active === 1 ? "border-b border-b-yellow-25 text-yellow-25" : "text-richblack-50"} cursor-pointer`}
                  onClick={() => setActive(1)}
                >
                  Most Popular
                </p>
                <p
                  className={`px-4 py-2 ${active === 2 ? "border-b border-b-yellow-25 text-yellow-25" : "text-richblack-50"} cursor-pointer`}
                  onClick={() => setActive(2)}
                >
                  New
                </p>
              </div>
              <div>
                <CourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses} />
              </div>
            </div>
          )}

          {/* Section 2 — Top courses in different category
              Only show if the different category actually has courses */}
          {differentCourses?.length > 0 && (
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
              <div className="section_heading">
                Top courses in {differentCategoryName}
              </div>
              <div className="py-8">
                <CourseSlider Courses={differentCourses} />
              </div>
            </div>
          )}

          {/* Section 3 — Frequently Bought */}
          <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
            <div className="section_heading">Frequently Bought</div>
            <div className="py-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {catalogPageData?.data?.mostSellingCourses
                  ?.slice(0, 4)
                  .map((course, i) => (
                    <Course_Card course={course} key={i} Height={"h-[400px]"} />
                  ))}
              </div>
            </div>
          </div>

          <Footer />
        </>
      )
    }
    
    export default Catalog