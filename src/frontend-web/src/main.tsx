// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import NotFoundPage from './pages/NotFoundPage.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import HomePage from './pages/HomePage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Events from './pages/Events.tsx'
import Profil from './pages/Profil.tsx'
import DashboardLayout from './utils/DashboardLayout.tsx';
import Resursi from './pages/Resursi.tsx'
import MainLayout from './utils/MainLayout.tsx'
import NoviDogadjaj from './pages/NoviDogadjaj.tsx'
import ProtectedRoute from './utils/ProtectedRoute.tsx'
import GuestRoute from './utils/GuestRoute.tsx'
import { UserProvider } from './hooks/UserContext';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import './index.css'
import "leaflet/dist/leaflet.css";
import EventDetails from './pages/EventDetails.tsx'
import Unauthorized from './pages/Unauthorized.tsx'
import SupplierLayout from './utils/SupplierLayout.tsx'
import SupplierOrders from './pages/SupplierOrders.tsx'
import SupplierResources from './pages/SupplierResources.tsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
        { index: true, element: <Navigate to="/home" replace /> },
        { path: 'unauthorized', element: <Unauthorized /> },
        {
            element: <GuestRoute />,
            children: [
                { path: 'home', element: <HomePage /> },
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
            ],
        },
        {
            element: <ProtectedRoute allowedRoles={["Admin"]} />,
            children: [
                {
                    element: <DashboardLayout />,
                    children: [
                        { path: 'dashboard', element: <Dashboard /> },
                        // { path: 'profil', element: <Profil /> },
                        { path: 'dogadjaji/novi-dogadjaj', element: <NoviDogadjaj /> },
                        { path: 'dogadjaji/:id', element: <EventDetails /> },
                        { path: 'dogadjaji', element: <Events /> },
                        { path: 'dobavljaci', element: <Resursi /> },
                        // { path: 'resursi/novi-resurs', element: <NoviResurs /> },
                    ]
                },
            ],
        },
        {
            path: 'supplier',
            element: <ProtectedRoute allowedRoles={["Supplier"]} />,
            children: [
                {
                    element: <SupplierLayout />,
                    children: [
                        // { path: 'dashboard', element: <SupplierDashboard /> },
                        { path: 'orders', element: <SupplierOrders /> },
                        { path: 'resources', element: <SupplierResources /> },
                    ]
                },
            ]
        },
        {
            // path: '/profil',
            element: <ProtectedRoute allowedRoles={["Admin", "Supplier"]} />,
            children: 
            [
                { path: 'profil', element: <Profil /> },
            ],    
        },
    ],
}
]);
 

createRoot(document.getElementById('root')!).render(
//   <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
//   </StrictMode>
);
