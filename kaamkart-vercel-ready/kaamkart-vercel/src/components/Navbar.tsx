import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin" : user?.role === "WORKER" ? "/worker" : "/customer";

  return (
    <nav className="bg-primary text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary font-extrabold text-base">
          K
        </span>
        <span>
          <span className="block text-lg font-extrabold leading-tight">KaamKart</span>
          <span className="block text-[11px] font-medium opacity-85 leading-tight">
            வேலை தேடுங்க, வேலை கொடுங்க
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to={dashboardPath} className="font-semibold hover:opacity-80 transition">
              Dashboard
            </Link>
            <span className="opacity-75 hidden sm:inline">{user.name}</span>
            <button onClick={handleLogout} className="font-semibold hover:opacity-80 transition">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-semibold hover:opacity-80 transition">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
