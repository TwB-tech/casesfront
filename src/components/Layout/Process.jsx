import ProcessCard from "../Cards/ProcessCards.jsx";
import Line from "../../assets/img/Line.png";
import { ProcessInfo } from "../../data.js";
import V1 from "../../assets/img/V1.png";
import V2 from "../../assets/img/V2.png";
import V3 from "../../assets/img/V3.png";
import V4 from "../../assets/img/V4.png";
import V5 from "../../assets/img/V5.png";

const Process = () => {
  return (
    <div className="mt-12 lg:mt-0 bg-gradient-to-r from-[#35D3FF] to-[#A963FB] w-full relative overflow-hidden">
      {/* Decorative Images */}
      <div className="hidden lg:block">
        <img
          src={V2}
          alt="decor"
          className="absolute top-0 left-0 z-10 w-16 sm:w-24 md:w-32"
          draggable={false}
        />
        <img
          src={V1}
          alt="decor"
          className="absolute -right-5 top-[60vh] scale-75 sm:scale-90 md:scale-100 z-10"
          draggable={false}
        />
        <img
          src={V3}
          alt="decor"
          className="absolute right-0 top-[30vh] w-20 sm:w-28 md:w-36 lg:w-40 z-10"
          draggable={false}
        />
        <img
          src={V4}
          alt="decor"
          className="absolute top-[90vh] left-10 w-16 sm:w-24 md:w-32 lg:w-36 z-10"
          draggable={false}
        />
        <img
          src={V5}
          alt="decor"
          className="absolute top-[85vh] lg:top-[75vh] lg:right-[30vw] w-14 sm:w-20 md:w-28 z-10"
          draggable={false}
        />
      </div>

       {/* Content Section */}
       <div className="py-12 px-6 lg:py-32 text-white flex flex-col items-center text-center z-20">
         <h2 className="opacity-70 mb-2 text-sm lg:text-base font-semibold tracking-wider">HOW WE ELIMINATE YOUR BOTTLENECKS</h2>
         <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-6">
           Legal Support When You Need It Most
         </h1>
         <p className="leading-normal sm:leading-relaxed mb-8 max-w-2xl text-lg opacity-90">
           Whether you're drowning in paperwork during trial season, facing unexpected staff shortages, or simply need to scale without hiring full-time employees — WakiliWorld adapts to your needs in real-time.
         </p>

        {/* Process Cards Section */}
        <div className="relative z-20 w-full px-4">
          {/* Line Decoration */}
          <img
            src={Line}
            alt="line"
            className="absolute left-1/2 transform -translate-x-1/2 w-1/2 sm:w-2/3 lg:w-1/3 h-auto"
            data-aos="fade-down"
            data-aos-delay="400"
            data-aos-duration="2000"
          />

          {/* Cards Container */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 max-w-screen-lg mx-auto">
            {ProcessInfo.map((item, index) => (
              <ProcessCard
                key={index}
                image={item.image}
                icon={item.icon}
                heading={item.heading}
                description={item.description}
                color={item.color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process;
