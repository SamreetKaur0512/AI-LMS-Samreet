import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"
import { FaLinkedin } from "react-icons/fa"

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-4 lg:p-6">

      {/* Chat with us */}
      <div className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200">
        <div className="flex flex-row items-center gap-3">
          <Icon3.HiChatBubbleLeftRight size={25} />
          <h1 className="text-lg font-semibold text-richblack-5">Chat with us</h1>
        </div>
        <p className="font-medium">Our friendly team is here to help.</p>
        <a
          href="mailto:samreet205@gmail.com"
          className="font-semibold text-yellow-400 hover:text-yellow-300 transition-all duration-200"
        >
          samreetk@agc.edu.in
        </a>
      </div>

      {/* Visit us */}
      <div className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200">
        <div className="flex flex-row items-center gap-3">
          <Icon1.BiWorld size={25} />
          <h1 className="text-lg font-semibold text-richblack-5">Visit us</h1>
        </div>
        <p className="font-medium">Come and say hello at our office HQ.</p>
        <p className="font-semibold">
          <a
            href="https://www.agcamritsar.in"
            target="_blank"
            rel="noreferrer"
            className="text-yellow-400 hover:text-yellow-300 transition-all duration-200"
          >
            Amritsar Group of Colleges
          </a>
          , GT Road, Amritsar, Punjab - 143001
        </p>
      </div>

      {/* Call us */}
      <div className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200">
        <div className="flex flex-row items-center gap-3">
          <Icon2.IoCall size={25} />
          <h1 className="text-lg font-semibold text-richblack-5">Call us</h1>
        </div>
        <p className="font-medium">Mon - Fri From 8am to 5pm</p>
        <p className="font-semibold">+123 456 7869</p>
      </div>

      {/* LinkedIn */}
      <div className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200">
        <div className="flex flex-row items-center gap-3">
          <FaLinkedin size={25} />
          <h1 className="text-lg font-semibold text-richblack-5">LinkedIn</h1>
        </div>
        <p className="font-medium">Connect with me professionally.</p>
        <a
          href="https://www.linkedin.com/in/samreet-kaur-470189312"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-yellow-400 hover:text-yellow-300 transition-all duration-200"
        >
          linkedin.com/in/samreetkaur
        </a>
      </div>

    </div>
  )
}

export default ContactDetails