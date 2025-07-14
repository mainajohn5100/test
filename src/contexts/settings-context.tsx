

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Organization } from '@/lib/data';
import { useAuth } from './auth-context';
import { getOrganizationById, updateOrganizationSettings } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT_OPTIONS = [
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 25, label: '25 minutes' },
    { value: 30, label: '30 minutes' },
];

export type LoadingScreenStyle = 'spinner' | 'skeleton';

// Merging local settings with DB settings for a comprehensive context
interface SettingsContextType extends Omit<Required<Organization>['settings'], 'emailTemplates'> {
  showFullScreenButton: boolean;
  setShowFullScreenButton: (show: boolean) => void;
  inAppNotifications: boolean;
  setInAppNotifications: (enabled: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  INACTIVITY_TIMEOUT_OPTIONS: typeof INACTIVITY_TIMEOUT_OPTIONS;
  loading: boolean;
  supportEmail: string;
  setSupportEmail: (email: string) => void;
  setAgentPanelEnabled: (enabled: boolean) => void;
  setClientPanelEnabled: (enabled: boolean) => void;
  setClientCanSelectProject: (enabled: boolean) => void;
  setAgentCanEditTeam: (enabled: boolean) => void;
  setExcludeClosedTickets: (enabled: boolean) => void;
  setInactivityTimeout: (minutes: number) => void;
  setLoadingScreenStyle: (style: LoadingScreenStyle) => void;
}

const defaultSettings = {
    agentPanelEnabled: true,
    clientPanelEnabled: true,
    clientCanSelectProject: true,
    agentCanEditTeam: false,
    excludeClosedTickets: false,
    inactivityTimeout: 15,
    loadingScreenStyle: 'spinner' as LoadingScreenStyle,
    supportEmail: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to safely get item from localStorage for local-only settings
const getItemFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
        if (item === 'true' || item === 'false') return item === 'true';
        if (!isNaN(Number(item))) return Number(item);
        return item;
    } catch {
        return defaultValue;
    }
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<Organization['settings']>(defaultSettings);
    const [loading, setLoading] = useState(true);

    // Local-only settings that are not part of the organization document
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);
    const [inAppNotifications, _setInAppNotifications] = useState(true);
    const [emailNotifications, _setEmailNotifications] = useState(false);

    useEffect(() => {
        _setShowFullScreenButton(getItemFromStorage('show-fullscreen-button', true));
        _setInAppNotifications(getItemFromStorage('in-app-notifications', true));
        _setEmailNotifications(getItemFromStorage('email-notifications', false));
    }, []);
    
    useEffect(() => {
        if (authLoading) return;
        if (user?.organizationId) {
            setLoading(true);
            getOrganizationById(user.organizationId)
                .then(org => {
                    if (org && org.settings) {
                        setSettings({ ...defaultSettings, ...org.settings });
                    } else {
                        setSettings(defaultSettings);
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch organization settings:", error);
                    toast({ title: "Error", description: "Could not load organization settings.", variant: "destructive" });
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, authLoading, toast]);
    
    const updateSetting = useCallback(async (update: Partial<Organization['settings']>) => {
        if (!user?.organizationId) {
            toast({ title: "Error", description: "You must be authenticated to change settings.", variant: "destructive" });
            return;
        }
        
        const oldSettings = { ...settings };
        // Optimistic update
        setSettings(prev => ({ ...prev, ...update }));

        try {
            await updateOrganizationSettings(user.organizationId, update);
        } catch (error) {
            console.error("Failed to update setting:", error);
            setSettings(oldSettings); // Revert on failure
            toast({ title: "Error", description: "Failed to save setting.", variant: "destructive" });
        }
    }, [user, toast, settings]);


    const setLocalStorageItem = (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    };

    const setShowFullScreenButton = (show: boolean) => {
        _setShowFullScreenButton(show);
        setLocalStorageItem('show-fullscreen-button', String(show));
    };

    const setInAppNotifications = (enabled: boolean) => {
        _setInAppNotifications(enabled);
        setLocalStorageItem('in-app-notifications', String(enabled));
    };

    const setEmailNotifications = (enabled: boolean) => {
        _setEmailNotifications(enabled);
        setLocalStorageItem('email-notifications', String(enabled));
    };

    const value: SettingsContextType = {
        showFullScreenButton,
        setShowFullScreenButton,
        inAppNotifications,
        setInAppNotifications,
        emailNotifications,
        setEmailNotifications,
        agentPanelEnabled: settings?.agentPanelEnabled ?? defaultSettings.agentPanelEnabled,
        clientPanelEnabled: settings?.clientPanelEnabled ?? defaultSettings.clientPanelEnabled,
        clientCanSelectProject: settings?.clientCanSelectProject ?? defaultSettings.clientCanSelectProject,
        agentCanEditTeam: settings?.agentCanEditTeam ?? defaultSettings.agentCanEditTeam,
        excludeClosedTickets: settings?.excludeClosedTickets ?? defaultSettings.excludeClosedTickets,
        inactivityTimeout: settings?.inactivityTimeout ?? defaultSettings.inactivityTimeout,
        loadingScreenStyle: settings?.loadingScreenStyle ?? defaultSettings.loadingScreenStyle,
        supportEmail: settings?.supportEmail ?? defaultSettings.supportEmail,
        setAgentPanelEnabled: (enabled: boolean) => updateSetting({ agentPanelEnabled: enabled }),
        setClientPanelEnabled: (enabled: boolean) => updateSetting({ clientPanelEnabled: enabled }),
        setClientCanSelectProject: (enabled: boolean) => updateSetting({ clientCanSelectProject: enabled }),
        setAgentCanEditTeam: (enabled: boolean) => updateSetting({ agentCanEditTeam: enabled }),
        setExcludeClosedTickets: (enabled: boolean) => updateSetting({ excludeClosedTickets: enabled }),
        setInactivityTimeout: (minutes: number) => updateSetting({ inactivityTimeout: minutes }),
        setLoadingScreenStyle: (style: LoadingScreenStyle) => updateSetting({ loadingScreenStyle: style }),
        setSupportEmail: (email: string) => {
            // This is a special case since it's saved via a button, not a direct toggle
            setSettings(prev => ({...prev, supportEmail: email}));
        },
        INACTIVITY_TIMEOUT_OPTIONS,
        loading: loading || authLoading,
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
