import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SearchPage from "@/pages/SearchPage";
import { appConfig } from "@/config/appConfig";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/*" 
          element={appConfig.isComingSoon ? <ComingSoonPage /> : <LandingPage />} 
        />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
