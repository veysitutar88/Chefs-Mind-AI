import { useState, useCallback, useEffect, useRef } from 'react';
import { ERROR_MAP, getErrorByCode } from '@/constants/errors';

export type JobStatus = 'idle' | 'generating' | 'polling' | 'success' | 'error' | 'retrying';

export interface MediaJob {
    id: string;
    status: JobStatus;
    type: 'image' | 'video';
    url?: string;
    error?: string;
    errorCode?: string;
    description: string;
    timestamp: number;
    retryCount: number;
    isOffline?: boolean;
    payload?: any;
}

interface UseMediaGeneratorProps {
    onMessage?: (role: 'system' | 'assistant', text: string) => void;
}

const MAX_RETRIES = 3;
const POLLING_INTERVAL = 2000;
const SUCCESS_AUTO_CLEAR_MS = 90000; // 90s

export const useMediaGenerator = ({ onMessage }: UseMediaGeneratorProps = {}) => {
    const [jobs, setJobs] = useState<MediaJob[]>([]);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(true); // Default to true, update in effect

    // Offline handling
    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-clear success jobs
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setJobs(prev => prev.filter(job =>
                !(job.status === 'success' && (now - job.timestamp > SUCCESS_AUTO_CLEAR_MS))
            ));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const createJob = (type: 'image' | 'video', description: string, payload: any) => {
        const id = Math.random().toString(36).substring(7);
        const job: MediaJob = {
            id,
            status: 'generating',
            type,
            description,
            timestamp: Date.now(),
            retryCount: 0,
            payload
        };
        setJobs(prev => [job, ...prev]);
        setActiveJobId(id);
        return id;
    };

    const updateJob = (id: string, updates: Partial<MediaJob>) => {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
        if (updates.status === 'success') {
            setActiveJobId(null);
        }
        // Don't clear activeJobId on error immediately to allow retry
    };

    const pollJob = useCallback(async (jobId: string) => {
        try {
            const res = await fetch(`/api/media/jobs/${jobId}`);
            if (!res.ok) throw new Error('Polling failed');

            const data = await res.json();

            if (data.status === 'completed') {
                updateJob(jobId, { status: 'success', url: data.assetUrl });
                if (onMessage) onMessage('assistant', `Generation complete: ${data.assetUrl}`);
            } else if (data.status === 'failed') {
                const errorInfo = getErrorByCode(data.errorCode || 'UNKNOWN');
                updateJob(jobId, { status: 'error', error: data.error || errorInfo.message, errorCode: data.errorCode });
                if (onMessage) onMessage('system', `Generation failed: ${data.error}`);
            } else {
                // Still processing
                setTimeout(() => pollJob(jobId), POLLING_INTERVAL);
            }
        } catch (e) {
            // Polling network error - retry silently a few times or degrade
            console.warn('Polling error', e);
            setTimeout(() => pollJob(jobId), POLLING_INTERVAL * 2);
        }
    }, [onMessage]);

    const generateMedia = useCallback(async (
        type: 'image' | 'video',
        payload: any,
        existingJobId?: string
    ) => {
        if (!navigator.onLine) {
            if (onMessage) onMessage('system', 'Cannot generate: You are offline.');
            return;
        }

        let jobId = existingJobId;

        if (!jobId) {
            const desc = `Generating ${type} with ${payload.modelId}...`;
            jobId = createJob(type, desc, payload);
            if (onMessage) onMessage('assistant', `${desc}`);
        } else {
            updateJob(jobId, { status: 'retrying', error: undefined });
        }

        const currentJob = jobs.find(j => j.id === jobId) || { retryCount: 0 };
        const attempt = (existingJobId ? currentJob.retryCount : 0) + 1;

        if (existingJobId) {
            updateJob(jobId!, { retryCount: attempt });
        }

        try {
            const endpoint = type === 'image' ? '/api/media/generate/image' : '/api/media/generate/video';

            // Artificial delay for 'retrying' state visibility
            if (existingJobId) await new Promise(r => setTimeout(r, 800));

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const code = errData.code || 'E_PROV_DOWN'; // Default to generic provider error
                throw { message: errData.error || res.statusText, code };
            }

            const data = await res.json();

            // Backend returns 202 Accepted and a jobId for polling/async
            if (data.jobId) {
                updateJob(jobId!, { status: 'polling' });
                pollJob(data.jobId); // Start polling actual backend job
            } else if (data.url) {
                // Sync response
                updateJob(jobId!, { status: 'success', url: data.url });
                if (onMessage) onMessage('assistant', `Generated ${type}: ${data.url}`);
            }

        } catch (error: any) {
            console.error('Media generation error:', error);
            const errInfo = getErrorByCode(error.code || 'UNKNOWN');
            const msg = error.message || errInfo.message;

            const isRetryable = errInfo.retryable && attempt <= MAX_RETRIES;

            if (isRetryable) {
                const backoff = 1000 * Math.pow(2, attempt);
                updateJob(jobId!, { status: 'retrying', error: `Retrying in ${backoff / 1000}s...` });

                setTimeout(() => {
                    generateMedia(type, payload, jobId);
                }, backoff);
            } else {
                updateJob(jobId!, { status: 'error', error: msg, errorCode: error.code });
                if (onMessage) onMessage('system', `Failed to generate: ${msg}`);
            }
        }
    }, [jobs, onMessage, pollJob]);

    const retryJob = useCallback((jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        if (job && job.payload) {
            generateMedia(job.type, job.payload, jobId);
        }
    }, [jobs, generateMedia]);

    const clearJob = useCallback((jobId: string) => {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        if (activeJobId === jobId) setActiveJobId(null);
    }, [activeJobId]);

    return {
        jobs,
        activeJobId,
        generateMedia,
        retryJob,
        clearJob,
        isOnline
    };
};
