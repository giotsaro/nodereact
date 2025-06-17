import { useEffect, useState } from "react";   
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "sonner";

const HRDashboard = () => {

  const [driverCount, setDriverCount] = useState(0);
  const [billingCount, setBillingCount] = useState(0);


  const fetchHRStats = async () => {
  try {
    const res = await API.get("/hr");
    const { driverCount, billingCount } = res.data;

    setDriverCount(driverCount);
    setBillingCount(billingCount);
  } catch (err) {
    toast.error("Error fetching HR stats: " + (err.response?.data?.message || err.message || "Server error"));
  }
};




useEffect(() => {
  fetchHRStats();
}, []);


    return (
      <div className="p-4  ">
        <h1 className="text-2xl font-bold text-black dark:text-white">HR Dashboard</h1>





        <div class="grid grid-cols-1 gap-4 px-4 mt-8 sm:grid-cols-4 sm:px-8">
<Link to="/drivers" className="block">
  <div className="flex items-center bg-white border rounded-sm overflow-hidden shadow cursor-pointer hover:shadow-lg transition-shadow">
    <div className="p-4 bg-green-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <div className="px-4 text-gray-700">
      <h3 className="text-sm tracking-wider">Total Drivers</h3>
      <p className="text-3xl">{driverCount}</p>
    </div>
  </div>
</Link>
<Link to="/billing" className="block">
  <div className="flex items-center bg-white border rounded-sm overflow-hidden shadow cursor-pointer hover:shadow-lg transition-shadow">
    <div className="p-4 bg-blue-400 hover:bg-blue-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
    </div>
    <div className="px-4 text-gray-700">
      <h3 className="text-sm tracking-wider">Total Billing Accounts</h3>
      <p className="text-3xl">{billingCount}</p>
    </div>
  </div>
</Link>





    <div class="flex items-center bg-white border rounded-sm overflow-hidden shadow">
        <div class="p-4 bg-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                </path>
            </svg></div>
        <div class="px-4 text-gray-700">
            <h3 class="text-sm tracking-wider">Total Comment</h3>
            <p class="text-3xl">142,334</p>
        </div>
    </div>
    <div class="flex items-center bg-white border rounded-sm overflow-hidden shadow">
        <div class="p-4 bg-red-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4">
                </path>
            </svg></div>
        <div class="px-4 text-gray-700">
            <h3 class="text-sm tracking-wider">Server Load</h3>
            <p class="text-3xl">34.12%</p>
        </div>
    </div>
</div>












      </div>
    );
  };
  
  export default HRDashboard;
  