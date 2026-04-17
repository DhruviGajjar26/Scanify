export interface User {
    email: string;
}

export interface Scan {
    _id: string;
    userId: string;
    fileName: string;
    fileType: 'pdf' | 'image';
    extractionDate: string; // ISO string
    originalPath: string; // URL/Path to original file
    extractedTextPath: string; // Path to a stored text file.
}

export interface DashboardStats {
    totalScans: number;
    imageScans: number;
    pdfScans: number;
}