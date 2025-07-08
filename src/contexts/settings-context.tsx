'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  showFullScreenButton: boolean;
  setShowFullScreenButton: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);

    useEffect(() => {
        const storedValue = localStorage.getItem('show-fullscreen-button');
        if (storedValue !== null) {
            _setShowFullScreenButton(storedValue === 'true');
        }
    }, []);

    const setShowFullScreenButton = (show: boolean) => {
        _setShowFullScreenButton(show);
        localStorage.setItem('show-fullscreen-button', String(show));
    };

    const value = { showFullScreenButton, setShowFullScreenButton };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
