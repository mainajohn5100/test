

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Organization, WhatsAppSettings, CannedResponse, SLAPolicy } from '@/lib/data';
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

const DEFAULT_TICKET_STATUSES = ['New', 'Active', 'Pending', 'On Hold', 'Closed', 'Terminated'];
const DEFAULT_CANNED_RESPONSES: CannedResponse[] = [
    { title: "Greeting", content: "Hi there! Thanks for reaching out. How can I help you today?" },
    { title: "Follow-up", content: "Just checking in to see if you had any other questions or if there's anything else I can help with." },
    { title: "Troubleshooting Steps", content: "Could you please try the following steps and let me know if it resolves the issue?\n1. Clear your browser cache and cookies.\n2. Try a different web browser.\n3. Restart your device." },
    { title: "Escalation", content: "I'm escalating this ticket to our senior support team. They will get back to you as soon as possible." },
    { title: "Resolution Confirmation", content: "We've implemented a fix for the issue you reported. Can you please confirm that everything is working as expected now?" },
];

const DEFAULT_SLA_POLICIES: SLAPolicy[] = [
    {
        id: 'default-sla',
        name: 'Default Policy',
        targets: [
            { priority: 'Urgent', firstResponseHours: 1, resolutionHours: 4 },
            { priority: 'High', firstResponseHours: 4, resolutionHours: 24 },
            { priority: 'Medium', firstResponseHours: 8, resolutionHours: 72 },
            { priority: 'Low', firstResponseHours: 24, resolutionHours: 168 },
        ]
    }
];

const DEFAULT_WHATSAPP_TEMPLATE = `Thanks for contacting us, {{user.name}}! We've received your message and created ticket #{{ticket.id}}. An agent will be with you shortly.`;

export type LoadingScreenStyle = 'spinner' | 'skeleton';

interface OrgSettings extends Omit<Required<Organization>['settings'], 'emailTemplates' | 'excludeClosedTickets' | 'loadingScreenStyle' | 'ticketStatuses' | 'cannedResponses' | 'slaPolicies'> {}

// Merging local settings with DB settings for a comprehensive context
interface SettingsContextType extends OrgSettings {
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
  whatsappSettings: Partial<WhatsAppSettings>;
  setWhatsappSettings: (settings: Partial<WhatsAppSettings>) => void;
  setAgentPanelEnabled: (enabled: boolean) => void;
  setClientPanelEnabled: (enabled: boolean) => void;
  setProjectsEnabled: (enabled: boolean) => void;
  setClientCanSelectProject: (enabled: boolean) => void;
  setInactivityTimeout: (minutes: number) => void;
  ticketStatuses: string[];
  setTicketStatuses: (statuses: string[]) => Promise<boolean>;
  cannedResponses: CannedResponse[];
  setCannedResponses: (responses: CannedResponse[]) => Promise<boolean>;
  slaPolicies: SLAPolicy[];
  setSlaPolicies: (policies: SLAPolicy[]) => Promise<boolean>;
  
  // New local/hybrid settings
  loadingScreenStyle: LoadingScreenStyle;
  setLoadingScreenStyle: (style: LoadingScreenStyle) => void;
  excludeClosedTickets: boolean;
  setExcludeClosedTickets: (enabled: boolean) => void;
}

const defaultOrgSettings: Required<Organization>['settings'] = {
    agentPanelEnabled: true,
    clientPanelEnabled: true,
    projectsEnabled: false,
    clientCanSelectProject: true,
    inactivityTimeout: 15,
    supportEmail: '',
    emailTemplates: {},
    whatsapp: {
        newTicketTemplate: DEFAULT_WHATSAPP_TEMPLATE,
    },
    excludeClosedTickets: false,
    ticketStatuses: DEFAULT_TICKET_STATUSES,
    cannedResponses: DEFAULT_CANNED_RESPONSES,
    slaPolicies: DEFAULT_SLA_POLICIES,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to safely get item from localStorage for local-only settings
const getItemFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined' || !key) return defaultValue;
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
    const [orgSettings, setOrgSettings] = useState<Partial<Organization['settings']>>(defaultOrgSettings);
    const [loading, setLoading] = useState(true);

    const orgId = user?.organizationId;

    // Keys are now organization-specific
    const showFullScreenKey = `show-fullscreen-button-${orgId}`;
    const inAppNotifyKey = `in-app-notifications-${orgId}`;
    const emailNotifyKey = `email-notifications-${orgId}`;
    const loadingStyleKey = `loading-screen-style-${orgId}`;
    const excludeClosedKey = `exclude-closed-tickets-${orgId}`;

    // Local-only settings that are not part of the organization document
    const [showFullScreenButton, _setShowFullScreenButton] = useState(true);
    const [inAppNotifications, _setInAppNotifications] = useState(true);
    const [emailNotifications, _setEmailNotifications] = useState(false);
    const [loadingScreenStyle, _setLoadingScreenStyle] = useState<LoadingScreenStyle>('spinner');
    const [excludeClosedTickets, _setExcludeClosedTickets] = useState(false);

    useEffect(() => {
        if (!orgId) return; // Don't load from storage until we have an org ID
        _setShowFullScreenButton(getItemFromStorage(showFullScreenKey, true));
        _setInAppNotifications(getItemFromStorage(inAppNotifyKey, true));
        _setEmailNotifications(getItemFromStorage(emailNotifyKey, false));
        _setLoadingScreenStyle(getItemFromStorage(loadingStyleKey, 'spinner'));
        _setExcludeClosedTickets(getItemFromStorage(excludeClosedKey, false));
    }, [orgId, showFullScreenKey, inAppNotifyKey, emailNotifyKey, loadingStyleKey, excludeClosedKey]);
    
    useEffect(() => {
        if (authLoading) return;
        if (user?.organizationId) {
            setLoading(true);
            getOrganizationById(user.organizationId)
                .then(org => {
                    if (org && org.settings) {
                        setOrgSettings({ ...defaultOrgSettings, ...org.settings });
                        // For admin, the local state for this setting should sync with org setting
                        if (user.role === 'Admin' && typeof org.settings.excludeClosedTickets === 'boolean') {
                          _setExcludeClosedTickets(org.settings.excludeClosedTickets);
                        }
                    } else {
                        setOrgSettings(defaultOrgSettings);
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
    
    const updateOrgSetting = useCallback(async (update: Partial<Organization['settings']>) => {
        if (!user?.organizationId) {
            toast({ title: "Error", description: "You must be authenticated to change settings.", variant: "destructive" });
            return false;
        }
        
        const oldSettings = { ...orgSettings };
        setOrgSettings(prev => ({ ...prev, ...update }));

        try {
            await updateOrganizationSettings(user.organizationId, update);
            return true;
        } catch (error) {
            console.error("Failed to update setting:", error);
            setOrgSettings(oldSettings);
            toast({ title: "Error", description: "Failed to save setting.", variant: "destructive" });
            return false;
        }
    }, [user, toast, orgSettings]);


    const setLocalStorageItem = (key: string, value: string) => {
        if (typeof window !== 'undefined' && key) { // Ensure key is not empty
            localStorage.setItem(key, value);
        }
    };
    
    const setExcludeClosedTicketsHandler = (enabled: boolean) => {
        if (user?.role === 'Admin') {
            updateOrgSetting({ excludeClosedTickets: enabled });
        }
        _setExcludeClosedTickets(enabled);
        setLocalStorageItem(excludeClosedKey, String(enabled));
    };

    const setShowFullScreenButton = (show: boolean) => {
        _setShowFullScreenButton(show);
        setLocalStorageItem(showFullScreenKey, String(show));
    };

    const setInAppNotifications = (enabled: boolean) => {
        _setInAppNotifications(enabled);
        setLocalStorageItem(inAppNotifyKey, String(enabled));
    };

    const setEmailNotifications = (enabled: boolean) => {
        _setEmailNotifications(enabled);
        setLocalStorageItem(emailNotifyKey, String(enabled));
    };
    
    const setLoadingScreenStyle = (style: LoadingScreenStyle) => {
        _setLoadingScreenStyle(style);
        setLocalStorageItem(loadingStyleKey, style);
    };
    
    const value: SettingsContextType = {
        showFullScreenButton,
        setShowFullScreenButton,
        inAppNotifications,
        setInAppNotifications,
        emailNotifications,
        setEmailNotifications,
        loadingScreenStyle,
        setLoadingScreenStyle,
        excludeClosedTickets,
        setExcludeClosedTickets: setExcludeClosedTicketsHandler,
        agentPanelEnabled: orgSettings?.agentPanelEnabled ?? defaultOrgSettings.agentPanelEnabled,
        clientPanelEnabled: orgSettings?.clientPanelEnabled ?? defaultOrgSettings.clientPanelEnabled,
        projectsEnabled: orgSettings?.projectsEnabled ?? defaultOrgSettings.projectsEnabled,
        clientCanSelectProject: orgSettings?.clientCanSelectProject ?? defaultOrgSettings.clientCanSelectProject,
        inactivityTimeout: orgSettings?.inactivityTimeout ?? defaultOrgSettings.inactivityTimeout,
        supportEmail: orgSettings?.supportEmail ?? defaultOrgSettings.supportEmail,
        whatsappSettings: orgSettings?.whatsapp ?? defaultOrgSettings.whatsapp,
        ticketStatuses: orgSettings?.ticketStatuses ?? DEFAULT_TICKET_STATUSES,
        cannedResponses: orgSettings?.cannedResponses ?? DEFAULT_CANNED_RESPONSES,
        slaPolicies: orgSettings?.slaPolicies ?? DEFAULT_SLA_POLICIES,
        setTicketStatuses: (statuses: string[]) => updateOrgSetting({ ticketStatuses: statuses }),
        setCannedResponses: (responses: CannedResponse[]) => updateOrgSetting({ cannedResponses: responses }),
        setSlaPolicies: (policies: SLAPolicy[]) => updateOrgSetting({ slaPolicies: policies }),
        setAgentPanelEnabled: (enabled: boolean) => updateOrgSetting({ agentPanelEnabled: enabled }),
        setClientPanelEnabled: (enabled: boolean) => updateOrgSetting({ clientPanelEnabled: enabled }),
        setProjectsEnabled: (enabled: boolean) => updateOrgSetting({ projectsEnabled: enabled }),
        setClientCanSelectProject: (enabled: boolean) => updateOrgSetting({ clientCanSelectProject: enabled }),
        setInactivityTimeout: (minutes: number) => updateOrgSetting({ inactivityTimeout: minutes }),
        setSupportEmail: (email: string) => {
            setOrgSettings(prev => ({...prev, supportEmail: email}));
        },
        setWhatsappSettings: (settings: Partial<WhatsAppSettings>) => updateOrgSetting({ whatsapp: settings }),
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
