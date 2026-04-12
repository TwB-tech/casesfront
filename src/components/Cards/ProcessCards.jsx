import { colorVariants } from "../../data";
const ProcessCard = ({ image, icon, heading, description, color }) => {
  // w-3/5 h-[20rem] bg-white

  return (
    <div
      className="w-[23rem] h-[28rem] lg:w-[72rem] lg:h-[16rem] bg-white mx-auto border rounded-lg mb-8 text-black relative"
      data-aos="fade-up"
      data-aos-delay="400"
      data-aos-duration="2000"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between py-20 lg:py-0 -mt-10">
        {/* max width */}
        <div className="lg:w-1/2">
          <img src={image} alt="banner" className=" lg:scale-75  " />
        </div>
        <div className="text-left ml-4 lg:ml-0 lg:w-1/2">
          <div
            className={`mb-4 w-[3rem] h-[3rem] ${colorVariants[color]} rounded-full items-center justify-center flex `}
          >
            <img src={icon} alt="icon" />
            {/* {color} */}
          </div>
          <h1 className="font-bold">{heading}</h1>
          <p className="text-[#595E64] lg:mr-20">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessCard;
