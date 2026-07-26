import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyse from "./pages/Analyse";
import ChatBot from "./pages/ChatBot";
import MealPlan from "./pages/MealPlan";
import Clients from "./pages/Clients";
import Profil from "./pages/Profil";
import Historique from "./pages/Historique";
import Recettes from "./pages/Recettes";
import Barcode from "./pages/Barcode";
import ChatWidget from "./components/ChatWidget";

export const AuthContext = createContext(null);
export const AnalysisContext = createContext(null);

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        setUserToken(token);
      } else {
        setUserToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userToken, loading, logout }}>
      <AnalysisContext.Provider value={{ analysisResult, setAnalysisResult }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analyse" element={<Analyse />} />
                      <Route path="/chatbot" element={<ChatBot />} />
                      <Route path="/meal-plan" element={<MealPlan />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/historique" element={<Historique />} />
                      <Route path="/recettes" element={<Recettes />} />
                      <Route path="/barcode" element={<Barcode />} />
                      <Route path="/profil" element={<Profil />} />
                    </Routes>
                  </Layout>
                  <ChatWidget />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AnalysisContext.Provider>
    </AuthContext.Provider>
  );
}
