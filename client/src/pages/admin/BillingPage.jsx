import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "sonner";

export default function BillingPage() {
  const [billing, setBilling] = useState([]);

  const fetchBilling = async () => {
    try {
      const res = await API.get("/billing");
      setBilling(res.data);
    } catch (err) {
      toast.error("error fetching billing data: " + (err.response?.data?.message || err.message || "Server error"));
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("are you sure?")) return;
    try {
      await API.delete(`/billing/${id}`);
      toast.success("deleted successfully");
      fetchBilling();
    } catch (err) {
      toast.error("error deleting account: " + (err.response?.data?.message || err.message || "Server error"));
    }
  };

  return (
    <div className="p-4 text-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Billing Accounts</h1>
        <Link to="/billing/new" className="flex gap-2 items-center bg-green-600 text-black dark:text-white px-3 py-2 rounded">
           New Account
        </Link>
      </div>

      <div className="overflow-auto"  >
        <table className="w-full border text-sm  text-black dark:text-white">
          <thead className="bg-blue-500 dark:text-white">
            <tr>
              {["full_name", "dob", "phone1", "phone2", "email", "zip", "address", "city", "state", "reputation", "notes", "legal_name", "ein", "Actions"].map((h) => (
                <th key={h} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {billing.map((b) => (
              <tr key={b.id} className="hover:bg-gray-400 dark:hover:bg-gray-700">
                <td className="border p-1">{b.full_name}</td>
                <td className="border p-1">{b.dob}</td>
                <td className="border p-1">{b.phone1}</td>
                <td className="border p-1">{b.phone2}</td>
                <td className="border p-1">{b.email}</td>
                <td className="border p-1">{b.zip}</td>
                <td className="border p-1">{b.address}</td>
                <td className="border p-1">{b.city}</td>
                <td className="border p-1">{b.state}</td>
                <td className="border p-1">{b.reputation}</td>
                <td className="border p-1">{b.notes}</td>
                <td className="border p-1">{b.legal_name}</td>
                <td className="border p-1">{b.ein}</td>
                <td className="border p-1 flex gap-2 justify-center">
                  <Link to={`/billing/${b.id}/edit`} className="text-blue-600">
                   edit
                  </Link>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600">
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
