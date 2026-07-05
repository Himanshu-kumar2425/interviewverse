import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/interview/ai", label: "AI Interview" },
  { to: "/interview/peer", label: "Peer Interview" },
  { to: "/resume", label: "Resume" },
  { to: "/reports", label: "Reports" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-surface-600 bg-surface-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-400">Interview</span>
          <span className="text-xl font-bold text-white">Verse</span>
        </Link>

        {/* Nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-gray-400 hover:text-gray-100 hover:bg-surface-700"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:bg-surface-700 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-semibold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name?.split(" ")[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
