// // app/index.tsx
// import { Redirect } from 'expo-router';

// export default function Index() {
//   return <Redirect href="/(tabs)/events" />;
// }

// // app/index.tsx
// import { Redirect } from "expo-router";
// import { useAuth } from "../contexts/AuthContext";

// export default function Index() {
//   const { accessToken } = useAuth();

//   // If logged in → go to events
//   // If not logged in → go to login
//   return (
//     <Redirect href={accessToken ? "/(tabs)/events" : "/login"} />
//   );
// }

import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { accessToken, loadingTokens } = useAuth();

  if (loadingTokens) return null; // wait for token to load

  return <Redirect href={accessToken ? '/(tabs)/events' : '/login'} />;
}
