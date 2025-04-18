import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
    return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );
}
