import React from 'react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart as ReBarChart, Bar, XAxis,
    YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { EmptyState } from './AdminUi';
import { BarChart3 } from 'lucide-react';

const AXIS_TICK = { fill: '#9CA3AF', fontSize: 10, fontFamily: 'ui-monospace, monospace' };
const GRID_COLOR = '#ffffff14';

export function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border-2 border-white bg-black px-3 py-2 text-xs">
            <p className="font-black uppercase tracking-widest text-neutral-300 text-[10px] mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="font-mono text-white">
                    {p.name}: <span className="text-brand-blue">{p.value?.toLocaleString?.() ?? p.value}</span>
                </p>
            ))}
        </div>
    );
}

export function RequestsChart({ data, height = 280 }: { data: Array<Record<string, any>>; height?: number }) {
    if (!data || data.length === 0) {
        return <EmptyState icon={BarChart3} title="No request data" message="No MCP requests in this range yet." />;
    }
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                    <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3D5CFF" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#3D5CFF" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: '#ffffff33' }} minTickGap={28} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="#3D5CFF" strokeWidth={2.5} fill="url(#reqFill)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function ToolBars({ data, height = 240 }: { data: Array<Record<string, any>>; height?: number }) {
    if (!data || data.length === 0) {
        return <EmptyState icon={BarChart3} title="No tool usage" message="No tool usage in this range." />;
    }
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ReBarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: '#ffffff33' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="total" name="Requests" radius={[0, 3, 3, 0]} fill="#3D5CFF" />
            </ReBarChart>
        </ResponsiveContainer>
    );
}

const PIE_COLORS = ['#3D5CFF', '#FFC700', '#7C3AED', '#FF3B30', '#22D3EE', '#F97316', '#A3A3A3'];

export function Donut({ data, height = 240 }: { data: Array<{ name: string; value: number }>; height?: number }) {
    if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
        return <EmptyState icon={BarChart3} title="No data" message="Nothing recorded in this range yet." />;
    }
    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="transparent">
                    {data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function LegendList({ items }: { items: Array<{ label: string; value: string; color?: string }> }) {
    return (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
            {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: it.color || PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">{it.label}</span>
                    <span className="text-[11px] font-mono font-bold text-white">{it.value}</span>
                </div>
            ))}
        </div>
    );
}