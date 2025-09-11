
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import { Moon, Sun, Loader } from 'lucide-react'
import * as React from 'react'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSettings } from '@/contexts/settings-context'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Please select a theme.',
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { user } = useAuth();
  const { setTheme, theme: mode } = useTheme()
  const settings = useSettings();
  
  const { 
    showFullScreenButton, 
    setShowFullScreenButton,
    excludeClosedTickets,
    setExcludeClosedTickets,
  } = settings;

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (mode as AppearanceFormValues['theme']) || 'system',
    },
  })

  if (settings.loading) {
    return (
        <div className="flex items-center justify-center p-10">
            <Loader className="h-6 w-6 animate-spin" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Mode</FormLabel>
              <FormDescription>
                Select the color mode for the dashboard.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value)
                  setTheme(value as AppearanceFormValues['theme'])
                }}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-1 pt-2 sm:grid-cols-3 gap-8"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Light
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                   <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="system" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="flex items-center justify-center h-[116px] text-muted-foreground">
                            <div className="text-center">
                                <Sun className="h-6 w-6 inline-block dark:hidden" />
                                <Moon className="h-6 w-6 hidden dark:inline-block" />
                                <p className="text-xs">System</p>
                            </div>
                        </div>
                    </div>
                     <span className="block w-full p-2 text-center font-normal">
                      System
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Separator />
         <div className="space-y-4">
            <h3 className="text-lg font-medium">Interface Elements</h3>
            <FormDescription>
                Manage visibility and default filters.
            </FormDescription>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Show Full Screen Button
                </FormLabel>
                <FormDescription>
                  Display the toggle in the application header (local setting).
                </FormDescription>
              </div>
              <Switch
                checked={showFullScreenButton}
                onCheckedChange={setShowFullScreenButton}
                aria-label="Toggle full screen button"
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel htmlFor="exclude-closed-tickets" className="text-base">
                        Exclude Closed Tickets
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                        Hide closed and terminated tickets from default views.
                        {user?.role === 'Admin' ? ' (This is an organization-wide setting)' : ' (This is a personal setting)'}
                    </p>
                </div>
                <Switch
                    id="exclude-closed-tickets"
                    checked={excludeClosedTickets}
                    onCheckedChange={setExcludeClosedTickets}
                    aria-label="Toggle excluding closed tickets"
                />
            </div>
        </div>
      </form>
    </Form>
  )
}
