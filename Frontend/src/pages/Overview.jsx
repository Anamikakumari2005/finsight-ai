import { useEffect, useState } from "react";
import client from "../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";

const Overview = () => {
  const { isLoggedIn } = useAuth();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      client.get("/expenses").then((res) => setExpenses(res.data));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <LoginPrompt />;

  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  const categoryData = Object.values(
    expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { category: e.category, total: 0 };
      acc[e.category].total += e.amount;
      return acc;
    }, {})
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 max-w-md mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500 mb-1">Total spending</p>
          <p className="text-2xl font-semibold text-slate-800">Rs {totalSpending.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500 mb-1">Total expenses</p>
          <p className="text-2xl font-semibold text-slate-800">{totalCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5" style={{ height: 300 }}>
        <p className="text-sm text-slate-500 mb-4">Category-wise spending</p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={categoryData}>
            <XAxis dataKey="category" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="total" fill="#334155" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;