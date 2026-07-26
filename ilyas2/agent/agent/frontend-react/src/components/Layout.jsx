import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import {
  LayoutDashboard,
  ScanLine,
  User,
  Clock,
  ChefHat,
  ScanBarcode,
  MessageCircle,
  CalendarCheck,
  Users,
  LogOut,
  Leaf,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyse", label: "Analyse", icon: ScanLine },
  { to: "/chatbot", label: "NutriBot AI", icon: MessageCircle },
  { to: "/meal-plan", label: "Meal Planning", icon: CalendarCheck },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/historique", label: "Historique", icon: Clock },
  { to: "/recettes", label: "Recettes", icon: ChefHat },
  { to: "/barcode", label: "Barcode", icon: ScanBarcode },
  { to: "/profil", label: "Profil", icon: User },
];

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = navItems.find((n) => n.to === location.pathname)?.label || "NutriVision";

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-950 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white">Nutri</span>
            <span className="text-lg font-extrabold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">Vision</span>
          </div>
          <button className="ml-auto lg:hidden p-1 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : "text-gray-400"}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* AI Badge */}
        <div className="mx-3 mb-3 p-3 bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-semibold text-gold-400">Gemma AI Activé</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Recommandations en temps réel</p>
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-500/30" />
            ) : (
              <div className="w-9 h-9 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-400 text-sm font-bold">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.displayName || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link w-full text-gray-500 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
