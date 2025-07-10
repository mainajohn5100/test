
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
  adminEmailPattern: string;
  setAdminEmailPattern: (pattern: string) => void;
  agentEmailPattern: string;
  setAgentEmailPattern: (pattern: string) => void;
  agentSignupEnabled: boolean;
  setAgentSignupEnabled: (enabled: boolean) => void;
  customerSignupEnabled: boolean;
  setCustomerSignupEnabled: (enabled: boolean) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);
    const [inAppNotifications, _setInAppNotifications] = useState(true);
    const [emailNotifications, _setEmailNotifications] = useState(false);
    const [agentPanelEnabled, _setAgentPanelEnabled] = useState(true);
    const [customerPanelEnabled, _setCustomerPanelEnabled] = useState(true);
    const [customerCanSelectProject, _setCustomerCanSelectProject] = useState(true);
    const [agentCanEditTeam, _setAgentCanEditTeam] = useState(true);
    const [adminEmailPattern, _setAdminEmailPattern] = useState('');
    const [agentEmailPattern, _setAgentEmailPattern] = useState('');
    const [agentSignupEnabled, _setAgentSignupEnabled] = useState(true);
    const [customerSignupEnabled, _setCustomerSignupEnabled] = useState(true);

    useEffect(() => {
        const loadSettings = () => {
            _setShowFullScreenButton(localStorage.getItem('show-fullscreen-button') !== 'false');
            _setInAppNotifications(localStorage.getItem('in-app-notifications') !== 'false');
            _setEmailNotifications(localStorage.getItem('email-notifications') === 'true');
            _setAgentPanelEnabled(localStorage.getItem('agent-panel-enabled') !== 'false');
            _setCustomerPanelEnabled(localStorage.getItem('customer-panel-enabled') !== 'false');
            _setCustomerCanSelectProject(localStorage.getItem('customer-can-select-project') !== 'false');
            _setAgentCanEditTeam(localStorage.getItem('agent-can-edit-team') !== 'false');
            _setAdminEmailPattern(localStorage.getItem('admin-email-pattern') || '*.admin.requestflow.app');
            _setAgentEmailPattern(localStorage.getItem('agent-email-pattern') || '*.agent.requestflow.app');
            _setAgentSignupEnabled(localStorage.getItem('agent-signup-enabled') !== 'false');
            _setCustomerSignupEnabled(localStorage.getItem('customer-signup-enabled') !== 'false');
            
            setLoading(false);
        };

        if (typeof window !== 'undefined') {
            loadSettings();
        } else {
            setLoading(false);
        }
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
        adminEmailPattern,
        setAdminEmailPattern,
        agentEmailPattern,
        setAgentEmailPattern,
        agentSignupEnabled,
        setAgentSignupEnabled,
        customerSignupEnabled,
        setCustomerSignupEnabled,
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
