// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { DoctorsList } from "./pages/DoctorsList.jsx";
import { SymptomChecker } from "./pages/SymptomChecker";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { LoginDoctor } from "./pages/LoginDoctor.jsx";
import { SignupDoctor } from "./pages/SigunpDoctor";
import { PacientAppointments } from "./pages/PacientAppointments";
import { ListAppointments } from "./pages/ListsAppointments";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPwDoctor } from "./pages/ForgotPwDoctor";
import { ResetPwDoctor } from "./pages/ResetPwDoctor";
import { DoctorCard } from "./components/DoctorCard.jsx";
import { DoctorPage } from "./pages/DoctorPage.jsx";



export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/symptom-checker" element={<SymptomChecker />} />
      <Route path="/api/pacient/signup" element={<Signup />} />
      <Route path="/api/pacient/login" element={<Login />} />
      <Route path="/api/doctor/register" element={<SignupDoctor />} />
      <Route path="/doctor/login" element={<LoginDoctor />} />
      <Route path="/api/pacient/appointments" element={<PacientAppointments />} />
      <Route path="/api/listappointments" element={<ListAppointments />} />
      <Route path="/api/pacient/forgotpassword" element={<ForgotPassword />} />
      <Route path="/api/pacient/resetpassword" element={<ResetPassword />} />
      <Route path="/api/doctor/forgotpassword" element={< ForgotPwDoctor />} />
      <Route path="/api/doctor/resetpassword" element={<ResetPwDoctor />} />
      <Route path="/find-doctors" element={<DoctorsList />} />
      <Route path="/doctorcard" element={<DoctorCard />} />
      <Route path="/doctorpage/:doctorId" element={<DoctorPage />} />

    </Route>
  )
);