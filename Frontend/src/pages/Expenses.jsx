import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";

const emptyForm = { date: "", category: "", amount: "", department: "", description: "" };

const Expenses = () => {
  const { isLoggedIn } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadExpenses = () => {
    client.get("/expenses").then((res) => setExpenses(res.data));
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadExpenses();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <LoginPrompt />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };

    if (editingId) {
      await client.put(`/expenses/${editingId}`, payload);
    } else {
      await client.post("/expenses", payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    loadExpenses();
  };

  const handleEdit = (expense) => {
    setForm({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      department: expense.department,
      description: expense.description || "",
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    await client.delete(`/expenses/${id}`);
    loadExpenses();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-6 grid grid-cols-5 gap-3">
        <input name="date" type="date" value={form.date} onChange={handleChange} required
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} required
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="bg-slate-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-slate-700">
          {editingId ? "Update" : "+ Add"}
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{e.date}</td>
                <td className="px-4 py-3">{e.category}</td>
                <td className="px-4 py-3">Rs {e.amount}</td>
                <td className="px-4 py-3">{e.department}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(e)} className="text-slate-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;