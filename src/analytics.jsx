import ReactGA from 'react-ga4';

const intitializeAnalytics = () => {
  const measurementId = import.meta.env.GA_ID || import.meta.env.REACT_APP_GA_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
  }
};

export default intitializeAnalytics;
