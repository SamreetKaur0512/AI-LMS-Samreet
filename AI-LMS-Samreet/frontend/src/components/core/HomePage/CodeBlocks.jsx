import React from "react";
import CTAButton from "./Button";
import { TypeAnimation } from "react-type-animation";
import { FaArrowRight } from "react-icons/fa";

const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {
  return (
    <div className={`flex ${position} my-12 w-full justify-between flex-col gap-8 lg:my-20 lg:gap-10`}>


      {/* Section 1  */}
      <div className="flex w-full flex-col gap-6 lg:w-[50%] lg:gap-8">
        {heading}

        {/* Sub Heading */}
        <div className="-mt-2 w-full text-base font-bold leading-7 text-richblack-300 lg:w-[85%]">
          {subheading}
        </div>

        {/* Button Group */}
        <div className="mt-3 flex flex-col gap-4 min-[420px]:flex-row sm:mt-7 sm:gap-7">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.link}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>
          <CTAButton active={ctabtn2.active} linkto={ctabtn2.link}>
            {ctabtn2.btnText}
          </CTAButton>
        </div>
      </div>

      {/* Section 2 */}
      <div className="code-border relative flex h-fit w-full max-w-full flex-row overflow-hidden py-3 text-[10px] leading-[18px] sm:text-sm sm:leading-6 lg:w-[470px]">
        {backgroundGradient}
        {/* Indexing */}
        <div className="text-center flex flex-col   w-[10%] select-none text-richblack-400 font-inter font-bold ">
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
          <p>5</p>
          <p>6</p>
          <p>7</p>
          <p>8</p>
          <p>9</p>
          <p>10</p>
          <p>11</p>
        </div>

        {/* Codes */}
        <div
          className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-1`}
        >
          <TypeAnimation
            sequence={[codeblock, 1000, ""]}
            cursor={true}
            repeat={Infinity}
            style={{
              whiteSpace: "pre-line",
              display: "block",
            }}
            omitDeletionAnimation={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
