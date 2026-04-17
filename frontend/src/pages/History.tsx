import React, { useEffect, useState } from 'react';
import { FileText, FileImage, Download } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/api';
import type { Scan } from '../types';

const History: React.FC = () => {
    const [history, setHistory] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/scans/history');
                console.log("HISTORY RESPONSE:", data);

                if (Array.isArray(data)) {
                    setHistory(data);
                } else if (Array.isArray(data.scans)) {
                    setHistory(data.scans);
                } else if (Array.isArray(data.data)) {
                    setHistory(data.data);
                } else {
                    setHistory([]);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
                setHistory([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // ✅ Download original file using scan._id
    const handleDownloadOriginal = async (scanId: string, fileName: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/api/scans/download/${scanId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download file. Please try again.");
        }
    };

    // ✅ Download extracted text file using scan._id
    const handleDownloadText = async (scanId: string, fileName: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:5000/api/scans/text/${scanId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Text fetch failed");

            const data = await response.json();

            // Create a .txt blob and download it
            const blob = new Blob([data.text], { type: "text/plain" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName.split('.')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Text download error:", error);
            alert("Failed to download text. Please try again.");
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading History...</div>;
    }

    return (
        <div className="space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold text-accent">Scan History</h1>
                <p className="text-lg text-text-secondary">
                    A record of all your processed documents
                </p>
            </header>

            <div className="bg-surface border border-surface-accent rounded-panel overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-surface-accent">
                        <tr>
                            <th className="p-6 text-sm font-semibold text-text-secondary uppercase">FILE NAME</th>
                            <th className="p-6 text-sm font-semibold text-text-secondary uppercase">TYPE</th>
                            <th className="p-6 text-sm font-semibold text-text-secondary uppercase">DATE</th>
                            <th className="p-6 text-sm font-semibold text-text-secondary uppercase text-right">ACTION</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-surface-accent/60">
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-text-secondary">
                                    No scans found. Start scanning documents.
                                </td>
                            </tr>
                        )}

                        {history.map((scan) => (
                            <tr key={scan._id} className="hover:bg-surface-accent/40 transition">
                                <td className="p-6 flex items-center gap-4">
                                    {scan.fileType === 'pdf'
                                        ? <FileText className="w-6 h-6 text-orange-400" />
                                        : <FileImage className="w-6 h-6 text-teal-400" />
                                    }
                                    <span className="font-semibold text-accent max-w-sm truncate">
                                        {scan.fileName}
                                    </span>
                                </td>

                                <td className="p-6">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize
                                        ${scan.fileType === 'pdf'
                                            ? 'bg-orange-400/10 text-orange-300'
                                            : 'bg-teal-400/10 text-teal-300'}`}>
                                        {scan.fileType}
                                    </span>
                                </td>

                                <td className="p-6 text-text-primary">
                                    {format(new Date(scan.extractionDate), 'dd/MM/yyyy, hh:mm a')}
                                </td>

                                <td className="p-6 text-right space-x-2">
                                    {/* ✅ Original button — downloads original file */}
                                    <button
                                        onClick={() => handleDownloadOriginal(scan._id, scan.fileName)}
                                        className="px-4 py-2 text-xs font-semibold bg-surface-accent text-accent hover:bg-surface-accent/80 rounded-button inline-flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Original
                                    </button>

                                    {/* ✅ Text button — downloads extracted .txt file */}
                                    <button
                                        onClick={() => handleDownloadText(scan._id, scan.fileName)}
                                        className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary-hover rounded-button inline-flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" /> Text
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;


// import React, { useEffect, useState } from 'react';
// import { FileText, FileImage, Download } from 'lucide-react';
// import { format } from 'date-fns';
// import api from '../api/api';
// import type { Scan } from '../types';

// const History: React.FC = () => {
//   const [history, setHistory] = useState<Scan[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch scan history
//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const { data } = await api.get('/scans/history');

//         console.log("HISTORY RESPONSE:", data);

//         if (Array.isArray(data)) setHistory(data);
//         else if (Array.isArray(data.scans)) setHistory(data.scans);
//         else if (Array.isArray(data.data)) setHistory(data.data);
//         else setHistory([]);
//       } catch (error) {
//         console.error("Failed to fetch history:", error);
//         setHistory([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   // ✅ Correct handleDownload with auth header & blob
//   const handleDownload = async (url: string, filename: string) => {
//     try {
//       const token = localStorage.getItem("token"); // adjust if using context or Redux

//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error("Download failed");

//       const blob = await response.blob();
//       const downloadUrl = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = downloadUrl;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();

//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(downloadUrl);
//     } catch (error) {
//       console.error("Download error:", error);
//       alert("Failed to download file. Please try again.");
//     }
//   };

//   if (loading) return <div className="text-center mt-10">Loading History...</div>;

//   return (
//     <div className="space-y-12">
//       <header className="space-y-2">
//         <h1 className="text-4xl font-extrabold text-accent">Scan History</h1>
//         <p className="text-lg text-text-secondary">
//           A record of all your processed documents
//         </p>
//       </header>

//       <div className="bg-surface border border-surface-accent rounded-panel overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="border-b border-surface-accent">
//             <tr>
//               <th className="p-6 text-sm font-semibold text-text-secondary uppercase">FILE NAME</th>
//               <th className="p-6 text-sm font-semibold text-text-secondary uppercase">TYPE</th>
//               <th className="p-6 text-sm font-semibold text-text-secondary uppercase">DATE</th>
//               <th className="p-6 text-sm font-semibold text-text-secondary uppercase text-right">ACTION</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-surface-accent/60">
//             {history.length === 0 && (
//               <tr>
//                 <td colSpan={4} className="p-10 text-center text-text-secondary">
//                   No scans found. Start scanning documents.
//                 </td>
//               </tr>
//             )}

//             {history.map((scan) => (
//               <tr key={scan._id} className="hover:bg-surface-accent/40 transition">
//                 <td className="p-6 flex items-center gap-4">
//                   {scan.fileType === 'pdf'
//                     ? <FileText className="w-6 h-6 text-orange-400" />
//                     : <FileImage className="w-6 h-6 text-teal-400" />
//                   }
//                   <span className="font-semibold text-accent max-w-sm truncate">
//                     {scan.fileName}
//                   </span>
//                 </td>

//                 <td className="p-6">
//                   <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize
//                     ${scan.fileType === 'pdf'
//                       ? 'bg-orange-400/10 text-orange-300'
//                       : 'bg-teal-400/10 text-teal-300'}`}>
//                     {scan.fileType}
//                   </span>
//                 </td>

//                 <td className="p-6 text-text-primary">
//                   {format(new Date(scan.extractionDate), 'dd/MM/yyyy, hh:mm a')}
//                 </td>

//                 <td className="p-6 text-right space-x-2">
//                   {scan.originalPath && (
//                     <button
//                       onClick={() =>
//                         handleDownload(
//                           `${import.meta.env.VITE_API_URL}/scans/download/${scan.fileName}`,
//                           scan.fileName
//                         )
//                       }
//                       className="px-4 py-2 text-xs font-semibold bg-surface-accent text-accent hover:bg-surface-accent/80 rounded-button inline-flex items-center gap-2"
//                     >
//                       <Download className="w-4 h-4" /> Original
//                     </button>
//                   )}

//                   {scan.extractedTextPath && (
//                     <button
//                       onClick={() =>
//                         handleDownload(
//                           `${import.meta.env.VITE_API_URL}/scans/download/text/${scan._id}`,
//                           `${scan.fileName.split('.')[0]}.txt`
//                         )
//                       }
//                       className="px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary-hover rounded-button inline-flex items-center gap-2"
//                     >
//                       <FileText className="w-4 h-4" /> Text
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default History;