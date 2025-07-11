

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

interface SettingsContextType {
  showFullScreenButton: boolean;
  setShowFullScreenButton: (show: boolean) => void;
  inAppNotifications: boolean;
  setInAppNotifications: (enabled: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  agentPanelEnabled: boolean;
  setAgentPanelEnabled: (enabled: boolean) => void;
  customerPanelEnabled: boolean;
  setCustomerPanelEnabled: (enabled: boolean) => void;
  customerCanSelectProject: boolean;
  setCustomerCanSelectProject: (enabled: boolean) => void;
  agentCanEditTeam: boolean;
  setAgentCanEditTeam: (enabled: boolean) => void;
  excludeClosedTickets: boolean;
  setExcludeClosedTickets: (enabled: boolean) => void;
  adminEmailPattern: string;
  setAdminEmailPattern: (pattern: string) => void;
  agentEmailPattern: string;
  setAgentEmailPattern: (pattern: string) => void;
  agentSignupEnabled: boolean;
  setAgentSignupEnabled: (enabled: boolean) => void;
  customerSignupEnabled: boolean;
  setCustomerSignupEnabled: (enabled: boolean) => void;
  inactivityTimeout: number;
  setInactivityTimeout: (minutes: number) => void;
  INACTIVITY_TIMEOUT_OPTIONS: typeof INACTIVITY_TIMEOUT_OPTIONS;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to safely get item from localStorage, only on client-side
const getItemFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
        if (item === 'true' || item === 'false') {
            return item === 'true';
        }
        if (!isNaN(Number(item))) {
            return Number(item);
        }
        return item;
    } catch {
        return defaultValue;
    }
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    // Initialize state with default values, which will be used for server-side rendering
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);
    const [inAppNotifications, _setInAppNotifications] = useState(true);
    const [emailNotifications, _setEmailNotifications] = useState(false);
    const [agentPanelEnabled, _setAgentPanelEnabled] = useState(true);
    const [customerPanelEnabled, _setCustomerPanelEnabled] = useState(true);
    const [customerCanSelectProject, _setCustomerCanSelectProject] = useState(true);
    const [agentCanEditTeam, _setAgentCanEditTeam] = useState(true);
    const [excludeClosedTickets, _setExcludeClosedTickets] = useState(false);
    const [adminEmailPattern, _setAdminEmailPattern] = useState('*.admin.requestflow.app');
    const [agentEmailPattern, _setAgentEmailPattern] = useState('*.agent.requestflow.app');
    const [agentSignupEnabled, _setAgentSignupEnabled] = useState(true);
    const [customerSignupEnabled, _setCustomerSignupEnabled] = useState(true);
    const [inactivityTimeout, _setInactivityTimeout] = useState(2); // Default to 2 minutes

    // Use useEffect to load settings from localStorage on the client-side
    useEffect(() => {
        _setShowFullScreenButton(getItemFromStorage('show-fullscreen-button', true));
        _setInAppNotifications(getItemFromStorage('in-app-notifications', true));
        _setEmailNotifications(getItemFromStorage('email-notifications', false));
        _setAgentPanelEnabled(getItemFromStorage('agent-panel-enabled', true));
        _setCustomerPanelEnabled(getItemFromStorage('customer-panel-enabled', true));
        _setCustomerCanSelectProject(getItemFromStorage('customer-can-select-project', true));
        _setAgentCanEditTeam(getItemFromStorage('agent-can-edit-team', true));
        _setExcludeClosedTickets(getItemFromStorage('exclude-closed-tickets', false));
        _setAdminEmailPattern(getItemFromStorage('admin-email-pattern', '*.admin.requestflow.app'));
        _setAgentEmailPattern(getItemFromStorage('agent-email-pattern', '*.agent.requestflow.app'));
        _setAgentSignupEnabled(getItemFromStorage('agent-signup-enabled', true));
        _setCustomerSignupEnabled(getItemFromStorage('customer-signup-enabled', true));
        _setInactivityTimeout(getItemFromStorage('inactivity-timeout', 2));

        setLoading(false);
    }, []);

    const setItem = (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    };

    const setShowFullScreenButton = (show: boolean) => {
        _setShowFullScreenButton(show);
        setItem('show-fullscreen-button', String(show));
    };

    const setInAppNotifications = (enabled: boolean) => {
        _setInAppNotifications(enabled);
        setItem('in-app-notifications', String(enabled));
    };

    const setEmailNotifications = (enabled: boolean) => {
        _setEmailNotifications(enabled);
        setItem('email-notifications', String(enabled));
    };

    const setAgentPanelEnabled = (enabled: boolean) => {
        _setAgentPanelEnabled(enabled);
        setItem('agent-panel-enabled', String(enabled));
    };

    const setCustomerPanelEnabled = (enabled: boolean) => {
        _setCustomerPanelEnabled(enabled);
        setItem('customer-panel-enabled', String(enabled));
    };

    const setCustomerCanSelectProject = (enabled: boolean) => {
        _setCustomerCanSelectProject(enabled);
        setItem('customer-can-select-project', String(enabled));
    };

    const setAgentCanEditTeam = (enabled: boolean) => {
        _setAgentCanEditTeam(enabled);
        setItem('agent-can-edit-team', String(enabled));
    };
    
    const setExcludeClosedTickets = (enabled: boolean) => {
        _setExcludeClosedTickets(enabled);
        setItem('exclude-closed-tickets', String(enabled));
    };

    const setAdminEmailPattern = (pattern: string) => {
        _setAdminEmailPattern(pattern);
        setItem('admin-email-pattern', pattern);
    };

    const setAgentEmailPattern = (pattern: string) => {
        _setAgentEmailPattern(pattern);
        setItem('agent-email-pattern', pattern);
    };
    
    const setAgentSignupEnabled = (enabled: boolean) => {
        _setAgentSignupEnabled(enabled);
        setItem('agent-signup-enabled', String(enabled));
    };

    const setCustomerSignupEnabled = (enabled: boolean) => {
        _setCustomerSignupEnabled(enabled);
        setItem('customer-signup-enabled', String(enabled));
    };

    const setInactivityTimeout = (minutes: number) => {
        _setInactivityTimeout(minutes);
        setItem('inactivity-timeout', String(minutes));
    };

    const value = { 
        showFullScreenButton, 
        setShowFullScreenButton,
        inAppNotifications,
        setInAppNotifications,
        emailNotifications,
        setEmailNotifications,
        agentPanelEnabled,
        setAgentPanelEnabled,
        customerPanelEnabled,
        setCustomerPanelEnabled,
        customerCanSelectProject,
        setCustomerCanSelectProject,
        agentCanEditTeam,
        setAgentCanEditTeam,
        excludeClosedTickets,
        setExcludeClosedTickets,
        adminEmailPattern,
        setAdminEmailPattern,
        agentEmailPattern,
        setAgentEmailPattern,
        agentSignupEnabled,
        setAgentSignupEnabled,
        customerSignupEnabled,
        setCustomerSignupEnabled,
        inactivityTimeout,
        setInactivityTimeout,
        INACTIVITY_TIMEOUT_OPTIONS,
        loading
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
