import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import facebookImage from "../../facebook-app-symbol.png";
import githubImage from "../../github.png";
import instagramImage from "../../instagram.png";

export default function Contact() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-background px-4 pt-24 text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-11">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Me</h1>
          <p className="mt-1 text-white/70">
            Want a Collaboration, Please Contact me!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4 flex items-center gap-3">
                <Mail className="h-5 w-5 text-white" />
                <div>
                  <p className="text-xs text-white/70 font-medium">Email</p>
                  <p className="text-sm font-semibold">smdevera@gbox.ncf.edu.ph</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4 flex items-center gap-3">
                <Phone className="h-5 w-5 text-white" />
                <div>
                  <p className="text-xs text-white/70 font-medium">Phone</p>
                  <p className="text-sm font-semibold">09709460391</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-white" />
                <div>
                  <p className="text-xs text-white/70 font-medium">Location</p>
                  <p className="text-sm font-semibold">Naga City, Philippines</p>
                </div>
              </CardContent>
            </Card>

          </div>

          <Card className="bg-card text-card-foreground md:col-span-2">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription className="text-white/70">
                Fill out the form below and I&apos;ll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Saicy Marie F. De Vera" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="smdevera@gbox.ncf.edu.ph" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="Project Inquiry / Hello" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea id="message" rows={4} placeholder="Your message here..." required />
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full bg-card text-card-foreground transition-all duration-500 ease-in-out hover:scale-[1.01] hover:rounded-3xl hover:bg-accent hover:shadow-xl">
          <CardContent className="flex flex-col items-start gap-2 p-3 sm:flex-row sm:items-center">
            <div className="rounded-lg bg-white/10 p-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm">Let’s connect</CardTitle>
              <CardDescription className="mt-1 text-xs text-white/70">
                Have a question or project in mind? I’d be happy to hear from you.
              </CardDescription>
            </div>
          </CardContent>
        </Card>

      </div>
      <footer className="mt-auto -mx-4 w-[calc(100%+2rem)] border-t border-white/15 px-4 py-2 text-xs text-white/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p>© 2026 Saicy Marie F. De Vera</p>
          <div aria-label="Social profiles" className="flex gap-2">
            <Image src={githubImage} alt="GitHub" width={18} height={18} className="size-4 object-contain" />
            <Image src={instagramImage} alt="Instagram" width={18} height={18} className="size-4 object-contain" />
            <Image src={facebookImage} alt="Facebook" width={18} height={18} className="size-4 object-contain" />
          </div>
        </div>
      </footer>
    </main>
  );
}
