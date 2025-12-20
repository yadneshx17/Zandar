import React from "react";
import { X, MoveRight, Github } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

const OnBoardingCard = ({ cardDismissal, setCardDismissal }) => {
  const navigate = useNavigate();

  return (
    // Outer Background (Dark Overlay)
    <div className="min-h-screen w-full bg-[#5E5E5E] flex items-center justify-center p-4">
      {/* The Main Card */}
      <div className="relative w-full max-w-[1200px] aspect-[16/10] bg-[#D1C8C8] rounded-[20px] shadow-2xl flex flex-col p-8 md:p-12">
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start">
          {/* Custom Logo (Abstract Z/H shape) */}
          <img src="/assets/logo_black.svg" alt="Logo" className="w-12 h-12 select-none" />

          <div
            className="top-1 font-jolly md:text-9xl text-black relative"
            style={{ textShadow: "0 4px 4px rgba(0,0,0,0.35)" }}
          >
            {/* <span className="font-serif">Welcome to </span>*/}
            <span className="text-[110px]">Zandar</span>
          </div>

          {/* Close Button */}
          {/* Remove Later, dont have power to play align things again :) */}
          <div
            className="
              flex items-center justify-center
              w-6 h-6
              text-black
              rounded-full
              hover:scale-105
              transition-transform
              font-serif
              text-[22px] animate-pulse
              "
          ></div>
        </div>

        {/* --- Main Content Section --- */}
        <div className="flex-1 flex flex-col items-center justify-center ">
          {/* Description Text - Serif Font */}
          <p className="font-serif text-black/90 text-2xl text-center -translate-y-28 max-w-2xl leading-snug tracking-wide">
            Local • Privacy-first • Customizable <br />
            browser startpage
          </p>

          {/* The Unique "Split-Pill" Button */}
          <div
            onClick={() => {
              setCardDismissal(true);
              navigate("/");
            }}
            className="mt-12 bg-black p-1.5 pl-1.5 pr-6 rounded-full inline-flex items-center gap-4 active:scale-95 cursor-pointer hover:scale-105 hover:shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-transform duration-300"
          >
            <button className="bg-[#D1C8C8] text-black font-serif text-2xl px-14 py-2 rounded-full hover:bg-white transition-colors">
              Get Started
            </button>
            <MoveRight className="text-white" size={30} strokeWidth={1.5} />
          </div>
        </div>

        {/* --- Footer Section --- */}
        <div className="relative flex items-end justify-between w-full h-10">
          {/* Bottom Left Icon (Glass/Chalice) */}
          <a
            href="https://github.com/yadneshx17/zandar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black"
          >
            <Github
              size={24}
              strokeWidth={1.5}
              fill="none"
              className="active:scale-95"
            />
            {/* Note: The image icon is unique, 'Wine' from lucide is the closest generic match.
                 For exact match, you'd use a custom SVG here. */}
          </a>
          
          <p className="text-xs font-instrument translate-y-5 text-slate-900 select-none">Customize anytime from Settings</p>

          {/* Centered "about" text */}
          {/* absolute left-1/2 */}
          <button
            className="-translate-x-1/2 translate-y-2 bottom-0 mt-2 hover:scale-95 active:scale-90 transition-transform duration-300"
            onClick={() => {
              navigate("/about");
              setCardDismissal(!cardDismissal);
            }}
          >
              <span className="font-serif text-black/80 text-[24px] font-bold ease-in cursor-pointer animate-pulse">
                about
              </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingCard;
