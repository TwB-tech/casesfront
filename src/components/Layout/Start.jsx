import Button from "../Button/Button";
import FootImg from "../../assets/img/footer.png";
import FootVector from "../../assets/img/Vector.png";
import computer from "../../assets/img/Programing.png";

const Start = () => {
  return (
    <div className="min-h-[90vh] w-full bg-gradient-to-l from-[#35D3FF] to-[#A963FB] mb-0">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-40 py-8 lg:py-[8rem] px-4 md:px-8 lg:px-16">
        <div
          className="text-start"
          data-aos="fade-right"
          data-aos-delay="400"
          data-aos-duration="2000"
        >
          <h1 className="ml-0 text-[#FFFFFF] lg:mb-4 opacity-70 text-base md:text-lg lg:text-xl">
            START WITH US
          </h1>
          <h1 className="ml-0 text-[1.5rem] md:text-[2.5rem] lg:text-[3rem] font-medium text-white mb-4">
            Start Working <br className="hidden lg:inline" /> Faster Today
          </h1>
          <p className="ml-0 text-white mb-6 lg:mb-8 text-xs md:text-sm lg:text-lg">
            From Intake to Verdict, Manage Every Step
            <br /> while empowering Advocates with Innovative Tools <br />
            To Streamline Your Legal Workflow
          </p>
          <Button text="GET STARTED" className="ml-0" />
        </div>
        {/* Image Section */}
        <div
          className="relative -mt-6 lg:mt-0 z-10"
          data-aos="fade-left"
          data-aos-delay="400"
          data-aos-duration="2000"
        >
          <img
            src={computer}
            alt="Programming illustration"
            className="w-64 md:w-80 lg:w-96 z-30 relative"
          />
          <img
            src={FootVector}
            alt="Vector illustration"
            className="absolute -top-10 right-0 w-32 md:w-40 lg:w-48 z-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Start;
