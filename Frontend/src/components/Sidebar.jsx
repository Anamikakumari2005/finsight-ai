import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `text-left px-3 py-2 rounded-lg transition-colors ${
    isActive ? "bg-slate-700 text-white font-medium" : "hover:bg-slate-800"
  }`;

const Sidebar = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col py-6 px-4">
      <h1 className="text-lg font-semibold text-white px-3 mb-8">FinSight</h1>
      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={linkClass}>Overview</NavLink>
        <NavLink to="/expenses" className={linkClass}>Expenses</NavLink>
        <NavLink to="/ask" className={linkClass}>Ask</NavLink>
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        {isLoggedIn ? (
          <button onClick={logout} className="text-left px-3 py-2 rounded-lg hover:bg-slate-800">
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/signup" className={linkClass}>Sign up</NavLink>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;