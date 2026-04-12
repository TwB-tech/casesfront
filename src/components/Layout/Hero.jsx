import useAuth from "../../hooks/useAuth";
import lawyer from "../../assets/img/Lawyer.png";

const Hero = () => {
    const {user } = useAuth()


  return (
    <section className="mb-8 mt-4 px-4 md:px-8" data-aos="fade-up" data-aos-delay="1200">
      <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-snug">
            Manage Cases, Clients, and Documents with Ease
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Simplify Case Handling and Boost Productivity with your Legal Practice using Cutting-Edge Technology.
          </p>
          {user && user ? (<div> <a
              href="/home"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-gray-700 hover:text-gray-500 font-medium border rounded-lg transition-all active:bg-gray-100"
            >
              {`Hello ${user.username}, Continue to Dashboard`}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a></div>) : (
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
            <a
              href="/login"
              className="w-full sm:w-auto py-3 px-6 text-center text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-md transition-all"
            >
              Let's get started
            </a>
            <a
              href="/home"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-gray-700 hover:text-gray-500 font-medium border rounded-lg transition-all active:bg-gray-100"
            >
              Go to Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        )}
        </div>

        {/* Image Section */}
        <div className="flex-1">
          <img
            src={lawyer}
            alt="lawyer"
            className="w-full h-auto max-w-sm md:max-w-md lg:max-w-lg mx-auto rounded-lg object-cover"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
