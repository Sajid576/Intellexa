'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/client';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CreateContentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        prompt: '',
        type: 'Blog Post Outline',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null); // { status: string, message: string }

    useEffect(() => {
        if (!user) return;

        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            query: { userId: user.id },
        });

        socket.on('content-generated', (data: any) => {
            if (data.status === 'completed') {
                setStatus({ status: 'completed', message: 'Content generated successfully!' });
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setStatus({ status: 'failed', message: 'Content generation failed.' });
                setLoading(false);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ status: 'pending', message: 'Adding to queue...' });

        try {
            const { data } = await apiClient.post('/content/generate', formData);
            setStatus({ status: 'queued', message: 'Job queued! Please wait 1 minute for AI processing.' });
        } catch (error) {
            alert('Failed to start generation');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4">
            <div className="max-w-2xl mx-auto py-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Generate Content</h1>
                            <p className="text-sm text-zinc-400">Our AI will craft the perfect content for you.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Content Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g., My Awesome Blog Post"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Content Type</label>
                                <select
                                    className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Blog Post Outline</option>
                                    <option>Product Description</option>
                                    <option>Social Media Caption</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Topic / Prompt</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full mt-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                    placeholder="Describe what you want the AI to generate..."
                                    value={formData.prompt}
                                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate with AI
                                </>
                            )}
                        </button>
                    </form>

                    {status && (
                        <div className="mt-8 p-4 bg-zinc-800/50 border border-zinc-700 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3">
                                {status.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : status.status === 'failed' ? (
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px]">X</div>
                                ) : (
                                    <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                                )}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
