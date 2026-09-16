import { useState } from "react";
import client from "../api/client";

const Ask = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer(null);
    try {
      const res = await client.post("/agent-ask", null, { params: { question } });
      setAnswer(res.data.answer);
      setRoute(res.data.route);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAsk} className="flex gap-3 mb-6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Did Sales department travel spending exceed the policy limit?"
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm"
        />
        <button type="submit" disabled={loading}
          className="bg-slate-900 text-white text-sm font-medium rounded-lg px-5 py-2 hover:bg-slate-700 disabled:opacity-50">
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {answer && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          {route && (
            <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1 mb-3">
              route: {route}
            </span>
          )}
          <p className="text-slate-700 text-sm whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Ask;