import { BrowserRouter, Routes, Route } from "react-router-dom";  // Import Context
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./components/adminside/AdminProjectDetails";
import UpdateProgress from "./components/adminside/AdmintUpdateNewProgress";
import MaterialTrack from "./components/adminside/AdminMaterialTrack";
import LaborManagement from "./components/adminside/AdminLaborManagement";
import Registrations from "./components/adminside/NewRegistrations";
import Dashboard from "./components/adminside/AdminDashboard";
import ProjectsSection1 from "./components/adminside/AdmintProjectManagement";
import { RegistrationProvider } from "./components/adminside/RegistrationContext";
import ProgressDetail from "./components/adminside/AdminProgressDetail";
import ClientDashboard from "./components/clientside/ClientDashboard";
import ClientProjectDetails from "./components/clientside/ClientProjectDetails";
import ClientProgressDetails from "./components/clientside/ClientProgressDetails";
import ClientMaterialTrack from "./components/clientside/ClientMaterialTrack";
import ClientLaborManagement from "./components/clientside/ClientLaborManagement";
import ClientProgressViewed from "./components/clientside/ClientProgressViewed";
import ContactForm from "./components/clientside/ContactForm";

function App() {
  return (
    <RegistrationProvider> {/* Wrap everything inside the provider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/admin" element={<Dashboard />} /> 
          <Route path="/admin/projectsection" element={<ProjectsSection1 />} />
          <Route path="/admin/projectsection/details/:id" element={<ProjectDetails />} />
          <Route path="/admin/projectsection/details/:id/viewfullprogress" element={<UpdateProgress />} />
          <Route path="/admin/projectsection/details/:id/material-track" element={<MaterialTrack />} />
          <Route path="/admin/projectsection/details/:id/labor-management" element={<LaborManagement />} />
          <Route path="/admin/registrations" element={<Registrations />} />
          <Route path="/admin/projectsection/details/:id/viewfullprogress/:progressId" element={<ProgressDetail />} />
          <Route path="/clientdashboard" element={<ClientDashboard />} />
          <Route path="/clientdashboard/projects/:id" element={<ClientProjectDetails/>} />
          <Route path="/clientdashboard/projects/:id/progress" element={<ClientProgressDetails/>} />
          <Route path="/clientdashboard/projects/:id/materials" element={<ClientMaterialTrack/>} />
          <Route path="/clientdashboard/projects/:id/labor" element={<ClientLaborManagement/>} />
          <Route path="/clientdashboard/progress/viewed/:progressId" element={<ClientProgressViewed />}/> 
        </Routes>
      </BrowserRouter>
    </RegistrationProvider>
  );
}
export default App;
