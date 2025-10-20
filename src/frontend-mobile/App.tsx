/*import React, { JSX, useState } from 'react';
import LoginScreen from './app/screens/LoginScreen';
import RegisterScreen from './app/screens/RegisterScreen';
import EventsScreen from './app/screens/EventsScreen';

type Screen = 'login' | 'register' | 'events';

const App = (): JSX.Element => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const navigateToRegister = () => {
    setCurrentScreen('register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const navigateToEvents = () => {
    setCurrentScreen('events');
  };

  if (currentScreen === 'register') {
    return <RegisterScreen onNavigateToLogin={navigateToLogin} />;
  }

  if (currentScreen === 'events') {
    return <EventsScreen onNavigateToLogin={navigateToLogin} />;
  }

  return <LoginScreen onNavigateToRegister={navigateToRegister} onNavigateToEvents={navigateToEvents} />;
};

export default App;*/

// // app/index.tsx
// // import { Redirect } from 'expo-router';
// import { Slot } from "expo-router";

// export default function Index() {
//   // return <Redirect href="/(tabs)/events" />;
//   return <Slot />;
// }