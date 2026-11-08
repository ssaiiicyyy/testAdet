import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Award } from "lucide-react";

const educationList = [
  {
    degree: "BS in Computer Science",
    institution: "Naga College Foundation",
    period: "2025- Present",
    description: "Fostering and focusing on web, software, and application development",
    achievements: ["Asean Hackathon 2026 (Top 40)", "Peer Code Reviewer", "UI/UX Designer", "Frontend Developer"]},

  {
    degree: "High School Education",
    institution: "Homobono H. Gonzalez National High School",
    period: "2024-2025",
    description: "Foundation for graphic and designing visual art and desgins",
    achievements: ["With High Honors (First Semester)","With High Honors (Second Semester)","Highschool Publication Material Editor", "Layout Editor", "Logo Arist", "Traditional Artist"],
  },
];

export default function Education() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Education</h1>
        <p className="text-muted-foreground mt-1">Academic background and formal training.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {educationList.map((item) => (
          <Card key={item.degree} className="h-full">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{item.degree}</CardTitle>
                    <CardDescription>{item.institution}</CardDescription>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {item.period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{item.description}</p>
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                  <Award className="h-4 w-4 text-primary" /> Key Highlights
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {item.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
