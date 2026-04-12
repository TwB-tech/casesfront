import ReactGA from 'react-ga4';

const intitializeAnalytics = () => {
    const measurementId = process.env.REACT_APP_GA_ID;
    if (measurementId) {
        ReactGA.initialize(measurementId);
    }
};

export default intitializeAnalytics;
