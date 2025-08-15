import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SearchPage from "@/pages/SearchPage";
import AboutPage from "@/pages/AboutPage";
import CommunityPage from "@/pages/CommunityPage";
import MarketplacePage from "@/pages/MarketplacePage";
import { appConfig } from "@/config/appConfig";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={appConfig.isComingSoon ? <ComingSoonPage /> : <LandingPage />} 
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
