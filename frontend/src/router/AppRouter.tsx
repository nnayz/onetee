import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import { appConfig } from "@/config/appConfig";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/*" 
          element={appConfig.isComingSoon ? <ComingSoonPage /> : <LandingPage />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
