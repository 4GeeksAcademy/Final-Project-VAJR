// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { DoctorPage } from "./pages/DoctorPage";
import { DoctorDashboard } from "./pages/dashboardPage/DoctorDashboard";
import { PrivateDoctorRoute } from "./pages/dashboardPage/PrivateDoctorRoute"
import { LoginDoctor } from "./pages/LoginDoctor";


export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/doctorpage/:doctorId" element={<DoctorPage />} />
      <Route path="/doctor/login" element={<LoginDoctor />} />

      <Route
        path="/doctor/dashboard"
        element={
          <PrivateDoctorRoute>
            <DoctorDashboard />
          </PrivateDoctorRoute>
        }
      />

    </Route>
  )
);