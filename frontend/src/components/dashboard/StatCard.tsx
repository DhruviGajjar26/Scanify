import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor = "text-accent-icon" }) => {
    return (
        <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-40">
            <div className="flex justify-between items-center mb-auto">
                <h3 className="text-base text-text-secondary uppercase tracking-wider">{title}</h3>
                <div className={`w-10 h-10 rounded-xl bg-surface-accent flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-5xl font-extrabold text-accent">{value}</p>
        </div>
    );
};

export default StatCard;