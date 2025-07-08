'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: 'Please select a theme.',
  }),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

const accentColors = [
    { name: 'violet', hsl: '262 84% 60%', gradient: 'linear-gradient(to right, #f187fb, #439cfb)' },
    { name: 'orange', hsl: '25 95% 53%', gradient: 'linear-gradient(to right, #ea5459, #f7ba2c)' },
    { name: 'teal', hsl: '190 84% 60%', gradient: 'linear-gradient(to right, #6fe3e1, #5257e5)' },
    { name: 'blue', hsl: '217 91% 60%', gradient: 'linear-gradient(to right, #9fccfa, #0974f1)' },
]

export function AppearanceForm() {
  const { setTheme, theme } = useTheme()
  const [accentColor, setAccentColor] = React.useState(accentColors[0].name)

  React.useEffect(() => {
    const savedAccent = localStorage.getItem('accent-color') || accentColors[0].name
    handleAccentChange(savedAccent)
  }, [])

  const handleAccentChange = (name: string) => {
    setAccentColor(name)
    localStorage.setItem('accent-color', name)
    const selectedAccent = accentColors.find((ac) => ac.name === name)
    if (selectedAccent) {
      document.documentElement.style.setProperty('--accent-hsl', selectedAccent.hsl)
    }
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: (theme as AppearanceFormValues['theme']) || 'system',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
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
        <FormItem className="space-y-1">
            <FormLabel>Accent Color</FormLabel>
            <FormDescription>
                Select an accent color for the dashboard.
            </FormDescription>
            <div className="flex flex-wrap gap-4 pt-2">
                {accentColors.map((accent) => (
                    <button
                        key={accent.name}
                        type="button"
                        onClick={() => handleAccentChange(accent.name)}
                        className={cn(
                            'h-12 w-12 rounded-md border-2 transition-all',
                            accentColor === accent.name
                            ? 'ring-2 ring-ring ring-offset-2'
                            : 'border-muted'
                        )}
                        style={{ backgroundImage: accent.gradient }}
                        aria-label={`Select ${accent.name} accent color`}
                    />
                ))}
            </div>
        </FormItem>
      </form>
    </Form>
  )
}
