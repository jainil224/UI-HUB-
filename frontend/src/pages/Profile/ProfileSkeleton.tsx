import React from 'react';
import { Skeleton } from '../../components/ui/Skeleton';

const ProfileSkeleton: React.FC = () => (
    <main className="min-h-screen bg-brand-bg px-4 pb-20 pt-28">
        <div className="mx-auto w-full max-w-2xl">
            <header className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-2.5 w-16 rounded" />
                    <Skeleton className="h-7 w-40 rounded" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full" />
            </header>

            <section className="rounded-xl border-2 border-white bg-brand-surface p-6 brutal-shadow-blue sm:p-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <Skeleton variant="circle" className="h-28 w-28 shrink-0 border-2 border-white/15" />
                    <div className="w-full flex-1 space-y-3">
                        <Skeleton className="mx-auto h-3 w-24 sm:mx-0" />
                        <Skeleton className="mx-auto h-2.5 w-48 sm:mx-0" />
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
                            <Skeleton className="h-8 w-28 rounded" />
                            <Skeleton className="h-8 w-24 rounded" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-2.5 w-24" />
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                    <Skeleton className="h-16 w-full rounded-md" />
                    <div className="flex items-center justify-end gap-3 pt-1">
                        <Skeleton className="h-9 w-20 rounded" />
                        <Skeleton className="h-9 w-32 rounded" glow />
                    </div>
                </div>
            </section>
        </div>
    </main>
);

export default ProfileSkeleton;
