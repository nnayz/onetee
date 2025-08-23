import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Layout from "@/layouts/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/components/Dashboard";
import { ProductManagement } from "@/components/ProductManagement";
import { OrderManagement } from "@/components/OrderManagement";
import { UserManagement } from "@/components/UserManagement";
import { CommunityManagement } from "@/components/CommunityManagement";
import { Analytics } from "@/components/Analytics";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/products/new" element={<ProductManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/community" element={<CommunityManagement />} />
                <Route path="/community/threads" element={<CommunityManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Dashboard />} />
                <Route path="/reports" element={<Dashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
        {/* Legacy route for backward compatibility */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}