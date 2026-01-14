'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Calendar, User, Sparkles, Loader2, Share2, Copy } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ContentDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const { data: content, isLoading, error } = useQuery({
        queryKey: ['content', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/content/${id}`);
            return data;
        },
        enabled: !!id, // Removed !!user to allow guest viewing
    });

    const copyToClipboard = () => {
        if (content?.body) {
            navigator.clipboard.writeText(content.body);
            toast.success('Content copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-zinc-400 animate-pulse">Fetching your masterpiece...</p>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
                <p className="text-zinc-400 mb-8">We couldn't find the content you're looking for.</p>
                <Link href="/dashboard" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            {/* Header / Nav */}
            <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={copyToClipboard}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Copy to clipboard"
                        >
                            <Copy className="w-5 h-5 text-zinc-300" />
                        </button>
                        <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5 text-zinc-300" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-full uppercase tracking-widest border border-blue-500/20">
                            {content.type}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${content.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            <span className="text-xs text-zinc-500 capitalize font-medium">{content.status}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-8 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        {content.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 border-y border-zinc-900 py-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(content.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{user?.name}</span>
                        </div>
                        {content.sentimentLabel && (
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                <span className={`font-semibold ${content.sentimentLabel === 'Positive' ? 'text-green-400' :
                                    content.sentimentLabel === 'Negative' ? 'text-red-400' : 'text-zinc-400'
                                    }`}>
                                    {content.sentimentLabel} Sentiment ({Math.round(content.sentimentScore * 100)}%)
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                <article className="prose prose-invert max-w-none">
                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <p className="text-xl text-zinc-300 leading-relaxed whitespace-pre-wrap font-light">
                            {content.body}
                        </p>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="mt-16 border-t border-zinc-800 pt-16">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        Comments
                        <span className="text-sm font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            {content.comments?.length || 0}
                        </span>
                    </h2>

                    {/* Comment Form */}
                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 mb-12">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Post a comment as guest</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const name = formData.get('name') as string;
                            const body = formData.get('body') as string;

                            if (!name || !body) return toast.error('Please fill in all fields');

                            const loadingToast = toast.loading('Analyzing and posting comment...');
                            try {
                                await apiClient.post(`/content/${id}/comments`, { name, body });
                                toast.success('Comment posted successfully!', { id: loadingToast });
                                (e.target as HTMLFormElement).reset();
                                // Refetch content to show the new comment
                                router.refresh();
                                window.location.reload();
                            } catch (err) {
                                toast.error('Failed to post comment', { id: loadingToast });
                            }
                        }} className="space-y-4">
                            <input
                                name="name"
                                type="text"
                                placeholder="Your Name"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <textarea
                                name="body"
                                placeholder="Write your thoughts..."
                                rows={3}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all ml-auto block">
                                Post Comment
                            </button>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {content.comments?.length > 0 ? (
                            content.comments.map((comment: any, idx: number) => (
                                <div key={idx} className="bg-zinc-900/20 border border-zinc-800/30 rounded-2xl p-6 transition-all hover:border-zinc-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                {comment.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">{comment.name}</h4>
                                                <p className="text-[10px] text-zinc-500">{new Date(comment.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {comment.sentimentLabel && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${comment.sentimentLabel === 'Positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                comment.sentimentLabel === 'Negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    comment.sentimentLabel === 'Analyzing...' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse' :
                                                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                }`}>
                                                {comment.sentimentLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{comment.body}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-zinc-600 py-8 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </section>

                <footer className="mt-24 text-center">
                    <p className="text-zinc-600 text-sm mb-6 italic">
                        Generated by AI • Content ID: {content._id}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        Return to workspace
                    </button>
                </footer>
            </main>
        </div>
    );
}
