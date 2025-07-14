

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
import type { LoadingScreenStyle } from '@/lib/data'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Please select a theme.',
  }),
  loadingScreenStyle: z.enum(['spinner', 'skeleton']),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { setTheme, theme: mode } = useTheme()
  const { 
    showFullScreenButton, 
    setShowFullScreenButton,
    loadingScreenStyle,
    setLoadingScreenStyle,
    excludeClosedTickets,
    setExcludeClosedTickets
  } = useSettings();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (mode as AppearanceFormValues['theme']) || 'system',
      loadingScreenStyle: loadingScreenStyle,
    },
  })

  React.useEffect(() => {
      form.setValue('loadingScreenStyle', loadingScreenStyle);
  }, [loadingScreenStyle, form]);

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
        <FormField
          control={form.control}
          name="loadingScreenStyle"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Loading Screen</FormLabel>
              <FormDescription>
                Choose the style for loading states across the application. This is an organization-wide setting.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value)
                  setLoadingScreenStyle(value as LoadingScreenStyle)
                }}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-1 pt-2 sm:grid-cols-2 gap-8"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="spinner" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="flex items-center justify-center p-2 h-24">
                          <Loader className="h-8 w-8 animate-spin" />
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Spinner
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="skeleton" className="sr-only" />
                    </FormControl>
                     <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-muted/50 p-2 h-24">
                        <div className="space-y-2 rounded-md bg-background/50 p-2 shadow-sm">
                          <div className="h-2 w-10/12 rounded-lg bg-muted" />
                          <div className="h-2 w-full rounded-lg bg-muted" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-background/50 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-muted" />
                          <div className="h-2 w-9/12 rounded-lg bg-muted" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Skeleton
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Separator />
         <div className="space-y-4">
            <FormLabel>Interface Elements</FormLabel>
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
                        Hide closed and terminated tickets from default views (organization-wide).
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
