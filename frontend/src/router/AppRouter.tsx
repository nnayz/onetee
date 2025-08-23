import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SearchPage from "@/pages/SearchPage";
import AboutPage from "@/pages/AboutPage";
import CommunityPage from "@/pages/CommunityPage";
import MarketplacePage from "@/pages/MarketplacePage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";

import ProtectedRoute from "@/router/ProtectedRoute";
import { appConfig } from "@/config/appConfig";
import Layout from "@/layouts/Layout";

const noFooterRoutes = ["/community", "/u/:username", "/thread/:id", "/login"]; 

const AppRouter = () => {
  return (
    <BrowserRouter>
    <Layout noFooterRoutes={noFooterRoutes}>
      <Routes>
        <Route 
          path="/" 
          element={appConfig.isComingSoon ? (
            <ComingSoonPage />
          ) : (
              <LandingPage />
          )} 
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/u/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;
