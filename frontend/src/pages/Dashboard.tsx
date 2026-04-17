// import React, { useEffect, useState } from 'react';
// import api from '../api/api';
// import { FileText, FileImage, Layers } from 'lucide-react';
// import StatCard from '../components/dashboard/StatCard';
// import { useAuth } from '../context/AuthContext';
// import type { DashboardStats } from '../types';

// const Dashboard: React.FC = () => {
//     const { user } = useAuth();
//     const [stats, setStats] = useState<DashboardStats | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 const { data } = await api.get('/scans/stats');
//                 setStats(data);
//             } catch (error) {
//                 console.error("Failed to fetch dashboard stats");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchStats();
//     }, []);

//     const userName = user?.email.split('@')[0] || 'User';

//     if(loading) return <div className="text-center mt-10">Loading Stats...</div>;

//     return (
//         <div className="space-y-12">
//             <header className="space-y-2">
//                 <h1 className="text-4xl font-extrabold text-accent">Welcome back, {userName}</h1>
//                 <p className="text-lg text-text-secondary">Here's your scanning overview</p>
//             </header>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 <StatCard
//                     title="Total Scans"
//                     value={stats?.totalScans || 0}
//                     icon={Layers}
//                     iconColor="text-primary"
//                 />
//                 <StatCard
//                     title="Images Scanned"
//                     value={stats?.imageScans || 0}
//                     icon={FileImage}
//                     iconColor="text-teal-400"
//                 />
//                  <StatCard
//                     title="PDFs Scanned"
//                     value={stats?.pdfScans || 0}
//                     icon={FileText}
//                     iconColor="text-orange-400"
//                 />
//             </div>
            
//             {/* Recent Scans section, reuse the HistoryTable from History page here for brevity */}
//             {/* In a real app, you would fetch only top 5 recent scans for this table */}
//         </div>
//     );
// };

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { FileText, FileImage, Layers } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState<DashboardStats>({
        totalScans: 0,
        imageScans: 0,
        pdfScans: 0
    });

    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/scans/stats');
            console.log("STARTS RESPONSE:", data); // Debug log
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const userName = user?.email?.split('@')[0] || 'User';

    if (loading) {
        return (
            <div className="text-center mt-10 text-lg">
                Loading Stats...
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold text-accent">
                    Welcome back, {userName}
                </h1>
                <p className="text-lg text-text-secondary">
                    Here's your scanning overview
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Total Scans"
                    value={stats.totalScans}
                    icon={Layers}
                    iconColor="text-primary"
                />
                <StatCard
                    title="Images Scanned"
                    value={stats.imageScans}
                    icon={FileImage}
                    iconColor="text-teal-400"
                />
                <StatCard
                    title="PDFs Scanned"
                    value={stats.pdfScans}
                    icon={FileText}
                    iconColor="text-orange-400"
                />
            </div>
        </div>
    );
};

export default Dashboard;