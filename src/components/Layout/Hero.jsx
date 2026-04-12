import useAuth from "../../hooks/useAuth";
import lawyer from "../../assets/img/Lawyer.png";

const Hero = () => {
    const {user } = useAuth()


  return (
    <section className="mb-8 mt-4 px-4 md:px-8" data-aos="fade-up" data-aos-delay="1200">
      <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 leading-snug">
            Overwhelmed by paperwork, tight deadlines, and resource shortages?
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            You shouldn't have to choose between growing your practice and maintaining work-life balance. WakiliWorld eliminates the bottlenecks that hold legal professionals back:
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-neutral-700"><strong className="text-primary-800">End burnout cycles</strong> - Get instant access to vetted remote paralegals when caseloads spike</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-neutral-700"><strong className="text-primary-800">Cut admin time by 60%</strong> - AI-powered case management that handles documentation automatically</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-neutral-700"><strong className="text-primary-800">Never miss a deadline</strong> - Your AI assistant Reya monitors cases 24/7 and proactively alerts you</p>
            </div>
          </div>
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
           <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8">
            <a
              href="/login"
              className="w-full sm:w-auto py-4 px-8 text-center text-white font-semibold bg-primary-800 hover:bg-primary-700 active:bg-primary-900 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Free 14-Day Trial - No Credit Card
            </a>
            <a
              href="#paralegals"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 text-primary-800 hover:text-primary-700 font-semibold border-2 border-primary-200 hover:border-primary-300 rounded-xl transition-all bg-white"
            >
              Hire a Paralegal Today
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
