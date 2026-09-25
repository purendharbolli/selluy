import React from 'react';
import { CityOnboardingModal } from '../components/common/CityOnboardingModal';
import { LoggedOutLanding } from '../components/home/LoggedOutLanding';

export const Home: React.FC = () => {
  return (
    <>
      <CityOnboardingModal />
      <LoggedOutLanding />
    </>
  );
};

export default Home;
