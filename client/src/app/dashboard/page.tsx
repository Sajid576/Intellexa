'use client';

import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: contents, isLoading, refetch } = useQuery({
        queryKey: ['contents', searchTerm],
        queryFn: async () => {
            const { data } = await apiClient.get(`/content?search=${searchTerm}`);
            return data;
        },
        enabled: !!user,
    });

    const deleteContent = async (id: string) => {
        if (confirm('Are you sure?')) {
            await apiClient.delete(`/content/${id}`);
            refetch();
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Navbar */}
            <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-blue-500" />
                        AI Content Pro
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-400">Hi, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        href="/create"
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Content
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contents?.map((item: any) => (
                            <div
                                key={item._id}
                                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all hover:shadow-2xl hover:shadow-blue-500/5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full uppercase tracking-wider">
                                        {item.type}
                                    </span>
                                    <button
                                        onClick={() => deleteContent(item._id)}
                                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.title}</h3>
                                <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{item.body}</p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' :
                                                item.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                                            }`} />
                                        <span className="text-xs text-zinc-500 capitalize">{item.status}</span>
                                    </div>
                                    {item.sentimentLabel && (
                                        <span className={`text-xs px-2 py-0.5 rounded ${item.sentimentLabel === 'Positive' ? 'bg-green-500/10 text-green-400' :
                                                item.sentimentLabel === 'Negative' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-zinc-500/10 text-zinc-400'
                                            }`}>
                                            {item.sentimentLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {contents?.length === 0 && !isLoading && (
                    <div className="text-center py-20 text-zinc-500">
                        <p>No content found. Start by creating something amazing!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
