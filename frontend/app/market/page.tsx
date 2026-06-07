'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Building2, Users,
  Activity, BarChart2, Globe, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { marketStats } from '@/lib/mockData';
import { pageGutterTailwindClass, sitePageShellClass } from '@/lib/responsive';
import {
  siteHeroLeadClass,
  siteHeroTitleClass,
  typeLabel,
  typeStatLabel,
  typeStatValue,
} from '@/lib/site-typography';
import { cn, formatCurrency } from '@/lib/utils';

const COLORS = ['#0E2347', '#D4A64A', '#1A2F57', '#E2BE73', '#6b7280'];

const cityData = [
  { city: 'New York', listings: 3420, avgPrice: 2100000, growth: 8.2 },
  { city: 'Los Angeles', listings: 2890, avgPrice: 1850000, growth: 6.4 },
  { city: 'Miami', listings: 2340, avgPrice: 980000, growth: 12.1 },
  { city: 'San Francisco', listings: 1980, avgPrice: 2400000, growth: 4.8 },
  { city: 'Chicago', listings: 1650, avgPrice: 720000, growth: 5.3 },
  { city: 'Austin', listings: 1420, avgPrice: 650000, growth: 15.7 },
];

const priceHistoryData = [
  { year: '2020', residential: 850000, commercial: 1200000, luxury: 3200000 },
  { year: '2021', residential: 920000, commercial: 1280000, luxury: 3600000 },
  { year: '2022', residential: 1050000, commercial: 1350000, luxury: 4100000 },
  { year: '2023', residential: 1180000, commercial: 1420000, luxury: 4500000 },
  { year: '2024', residential: 1250000, commercial: 1500000, luxury: 4900000 },
  { year: '2025', residential: 1320000, commercial: 1580000, luxury: 5200000 },
];

const pieData = [
  { name: 'Houses', value: 35 },
  { name: 'Apartments', value: 28 },
  { name: 'Condos', value: 18 },
  { name: 'Villas', value: 12 },
  { name: 'Other', value: 7 },
];

export default function MarketPage() {
  const [activeMetric, setActiveMetric] = useState<'volume' | 'price' | 'listings'>('volume');

  const topStats = [
    { label: 'Total Market Cap', value: '$2.8B', change: '+8.4%', positive: true, icon: DollarSign, color: '#D4A64A' },
    { label: 'Active Listings', value: '12,847', change: '+12.4%', positive: true, icon: Building2, color: '#0E2347' },
    { label: 'Active Investors', value: '48,000+', change: '+23.1%', positive: true, icon: Users, color: '#22c55e' },
    { label: 'Avg. Price Growth', value: '8.4%', change: 'YoY', positive: true, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Blockchain Verified', value: '99.9%', change: 'All listings', positive: true, icon: Activity, color: '#8b5cf6' },
    { label: 'Fractional Deals', value: '2,341', change: '+45.2%', positive: true, icon: Zap, color: '#f59e0b' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <div className="gradient-hero py-14">
          <div className={cn(sitePageShellClass, pageGutterTailwindClass)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="h-6 w-6 text-[#D4A64A]" />
                <span className={typeLabel}>Live Market Intelligence</span>
              </div>
              <h1 className={cn(siteHeroTitleClass, 'mb-3')}>Real Estate Market Analytics</h1>
              <p className={siteHeroLeadClass}>
                Real-time blockchain-verified market data, AI-powered insights, and comprehensive analytics 
                across all property types and markets.
              </p>
            </motion.div>
          </div>
        </div>

        <div className={cn(sitePageShellClass, pageGutterTailwindClass, 'space-y-8 py-8')}>
          {/* Top Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {topStats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-surface">
                      <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                    </div>
                    <Badge variant={stat.positive ? 'success' : 'danger'} size="sm">{stat.change}</Badge>
                  </div>
                  <p className={typeStatValue}>{stat.value}</p>
                  <p className={cn(typeStatLabel, 'mt-0.5')}>{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Volume Chart */}
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Monthly Transaction Volume</CardTitle>
                    <div className="flex gap-2">
                      {(['volume', 'price', 'listings'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setActiveMetric(m)}
                          className={cn(
                            'rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors',
                            activeMetric === m
                              ? 'bg-primary text-white dark:bg-card dark:text-foreground'
                              : 'bg-surface text-muted hover:bg-surface/80',
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={marketStats.monthlyData}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4A64A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D4A64A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0E2347" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0E2347" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Area type="monotone" dataKey="listings" stroke="#0E2347" fill="url(#grad2)" strokeWidth={2} name="Listings" />
                      <Area type="monotone" dataKey="sales" stroke="#D4A64A" fill="url(#grad1)" strokeWidth={2} name="Sales" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Type Pie */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader><CardTitle>Property Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-muted">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Price History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#D4A64A]" /> Price History by Segment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={priceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="residential" stroke="#0E2347" strokeWidth={2.5} dot={{ r: 4 }} name="Residential" />
                    <Line type="monotone" dataKey="commercial" stroke="#D4A64A" strokeWidth={2.5} dot={{ r: 4 }} name="Commercial" />
                    <Line type="monotone" dataKey="luxury" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Luxury" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Cities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#D4A64A]" /> Top Markets by Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['City', 'Active Listings', 'Avg. Price', 'YoY Growth', 'Trend'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cityData.map((city, i) => (
                        <tr key={city.city} className="hover:bg-[#F2F2F2] transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full gradient-navy flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                              <span className="font-semibold text-foreground">{city.city}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted">{city.listings.toLocaleString()}</td>
                          <td className="px-4 py-4 font-semibold text-foreground">{formatCurrency(city.avgPrice)}</td>
                          <td className="py-4 px-4">
                            <span className={`font-semibold ${city.growth > 10 ? 'text-green-600' : city.growth > 5 ? 'text-amber-600' : 'text-blue-600'}`}>
                              +{city.growth}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-[#D4A64A] h-1.5 rounded-full" style={{ width: `${Math.min(city.growth * 5, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
