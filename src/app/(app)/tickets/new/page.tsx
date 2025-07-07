import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileUp, Send } from "lucide-react";

export default function NewTicketPage() {
  const suggestedTags = ['UI', 'Bug', 'Backend', 'Feature Request'];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create New Ticket"
        description="Fill in the details below to submit a new ticket."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
              <CardDescription>Fill in the details for the new support ticket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input id="customer-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input id="customer-email" type="email" placeholder="john.doe@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input id="title" placeholder="e.g., Login issue on website" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Detailed description of the issue..." className="min-h-32"/>
              </div>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div> 
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project (Optional)</Label>
                <Select>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="website-redesign">Website Redesign</SelectItem>
                    <SelectItem value="api-v2">API V2</SelectItem>
                    <SelectItem value="reporting-module">Reporting Module</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee (Optional)</Label>
                <Select>
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Assign to an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="alex-johnson">Alex Johnson</SelectItem>
                    <SelectItem value="maria-garcia">Maria Garcia</SelectItem>
                    <SelectItem value="james-smith">James Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tags-input">Add Tags</Label>
                        <Input id="tags-input" placeholder="e.g., 'bug', 'v2.1'" />
                    </div>
                    <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Suggest Tags with AI
                        </Button>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {suggestedTags.map(tag => (
                                <Badge key={tag} variant="secondary" className="cursor-pointer">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full">
            <Send className="mr-2 h-4 w-4"/>
            Submit Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
