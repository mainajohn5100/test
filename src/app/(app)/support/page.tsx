
'use client';

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LifeBuoy, BookOpen, Send } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "You can reset your password from the login page by clicking the 'Forgot Password?' link. If you are already logged in, you can change your password under Settings > Account."
  },
  {
    question: "How do I add a new user to my organization?",
    answer: "As an Administrator, you can add new users by navigating to the 'User Accounts' page and clicking the 'Create User' button."
  },
  {
    question: "Can clients create tickets from within the app?",
    answer: "Yes, clients can create tickets by navigating to the 'Tickets' page and clicking the 'New Ticket' button. They can also create tickets by sending an email to your configured support address."
  },
  {
    question: "Where do I configure email or WhatsApp integrations?",
    answer: "Administrators can configure these integrations under the 'Channels' page, which can be found in the main navigation menu."
  }
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Support Center"
        description="Find help with your account, billing, and more."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Fill out the form below and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Issue with billing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Please describe your issue in detail..." rows={6} />
                </div>
                <div className="flex justify-end">
                   <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/ONBOARDING.md" target="_blank">
                        <BookOpen className="mr-2" />
                        Onboarding Guide
                    </Link>
                </Button>
                 <Button variant="outline" className="w-full justify-start" disabled>
                    <LifeBuoy className="mr-2" />
                    Community Forum
                </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
