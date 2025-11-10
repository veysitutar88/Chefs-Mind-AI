"use client";
import { useEffect, useState } from "react";

interface GoogleStatus {
  ok: boolean;
  expiry_date?: string | number;
  error?: string;
}

export default function GoogleConnect() {
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/auth/google/status");
        const data = await response.json();
        setStatus(data);
      } catch {
        setStatus({ ok: false, error: "Failed to check status" });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = "/auth/google/start";
  };

  const handleLogout = async () => {
    try {
      await fetch("/auth/google/logout", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleStatusCheck = async () => {
    try {
      const response = await fetch("/auth/google/status");
      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch {
      alert("Failed to get status");
    }
  };

  if (loading) {
    return (
      <div className="border rounded p-3 bg-white space-y-2">
        <div className="font-semibold">Google OAuth</div>
        <div className="text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="border rounded p-3 bg-white space-y-2">
      <div className="font-semibold">Google OAuth</div>
      <div className="text-sm">
        Status: {status?.ok ? "✅ Connected" : "❌ Not connected"}
      </div>
      {status?.expiry_date && (
        <div className="text-xs text-gray-500">
          Expires: {new Date(status.expiry_date).toLocaleString()}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {!status?.ok && (
          <button
            onClick={handleConnect}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Connect Google
          </button>
        )}
        {status?.ok && (
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            Logout
          </button>
        )}
        <button
          onClick={handleStatusCheck}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          Check Status
        </button>
      </div>
    </div>
  );
}