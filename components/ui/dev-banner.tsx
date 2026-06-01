"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DevBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Check if user has dismissed the banner before
        const dismissed = localStorage.getItem("devBannerDismissed");
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("devBannerDismissed", "true");
    };

    if (!isMounted || !isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
                <div className="flex-1 text-sm">
                    <p className="font-semibold">🚀 Dự án đang phát triển</p>
                    <p className="text-white/90 text-xs mt-1">
                        Website có thể gặp lỗi hoặc thiếu tính năng. Cảm ơn bạn đã thông cảm!
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Đóng thông báo"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
