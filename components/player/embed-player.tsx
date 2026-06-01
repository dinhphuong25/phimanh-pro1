"use client";

import { useState } from "react";

interface EmbedPlayerProps {
    videoUrl: string;
    onEnded?: () => void;
}

const EmbedPlayer = ({
    videoUrl,
    onEnded,
}: EmbedPlayerProps) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative bg-black rounded-lg shadow-2xl">
            <iframe
                src={videoUrl}
                className="w-full h-auto rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video"
                style={{ aspectRatio: '16/9' }}
                onLoad={() => setIsLoading(false)}
            />
            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-sm font-medium">Đang tải...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmbedPlayer;

