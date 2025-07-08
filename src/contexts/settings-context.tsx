
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  showFullScreenButton: boolean;
  setShowFullScreenButton: (show: boolean) => void;
  inAppNotifications: boolean;
  setInAppNotifications: (enabled: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);
    const [inAppNotifications, _setInAppNotifications] = useState(true);
    const [emailNotifications, _setEmailNotifications] = useState(false);

    useEffect(() => {
        const storedFullScreen = localStorage.getItem('show-fullscreen-button');
        if (storedFullScreen !== null) {
            _setShowFullScreenButton(storedFullScreen === 'true');
        }
        
        const storedInApp = localStorage.getItem('in-app-notifications');
        if (storedInApp !== null) {
            _setInAppNotifications(storedInApp === 'true');
        }

        const storedEmail = localStorage.getItem('email-notifications');
        if (storedEmail !== null) {
            _setEmailNotifications(storedEmail === 'true');
        }

    }, []);

    const setShowFullScreenButton = (show: boolean) => {
        _setShowFullScreenButton(show);
        localStorage.setItem('show-fullscreen-button', String(show));
    };

    const setInAppNotifications = (enabled: boolean) => {
        _setInAppNotifications(enabled);
        localStorage.setItem('in-app-notifications', String(enabled));
    };

    const setEmailNotifications = (enabled: boolean) => {
        _setEmailNotifications(enabled);
        localStorage.setItem('email-notifications', String(enabled));
    };

    const value = { 
        showFullScreenButton, 
        setShowFullScreenButton,
        inAppNotifications,
        setInAppNotifications,
        emailNotifications,
        setEmailNotifications
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
