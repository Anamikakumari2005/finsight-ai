import { Link } from "react-router-dom";

const LoginPrompt = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-sm mx-auto mt-10">
    <p className="text-slate-600 mb-4">Please log in to view your data.</p>
    <Link to="/login" className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-700">
      Login
    </Link>
  </div>
);

export default LoginPrompt;