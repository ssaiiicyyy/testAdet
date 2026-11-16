import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Gamepad2, Music, Dumbbell, Plane, BookOpen, Brush, Sparkles, Computer, ComputerIcon } from "lucide-react";

const hobbies = [
  {
    title: "Graphic Designing",
    icon: Brush,
    description: "Creating a visual art across different editing platforms such as Figma, Canva and Ibis Paint",
    sizeClass: "min-h-60",
  },
  {
    title: "Gaming",
    icon: Gamepad2,
    description: "Enthusiast for simple interactive pixelated games ",
  },
 {
    title: "Exploring AI",
    icon: ComputerIcon,
    description: "Navigating and fostering my skills of design and integrating to ai to create ui/ux designs",
  },
  {
    title: "Reading",
    icon: BookOpen,
    description: "Into motivational and inspiring book such as Ikiggai and fictional novels",
  },
];

export default function Hobbies() {
  return (
    <div className="space-y-11 max-w-4xl mx-auto pt-24 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hobbies & Interests</h1>
        <p className="text-muted-foreground mt-1">The things that makes my life fascinated beyond coding.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hobbies.map((hobby) => {
          const Icon = hobby.icon;
          return (
            <Card
              key={hobby.title}
              className={`gap-8 bg-card text-card-foreground transition-shadow hover:bg-accent hover:shadow-md ${
                "sizeClass" in hobby ? hobby.sizeClass : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{hobby.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                <p className="text-sm text-muted-foreground">{hobby.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="flex-col gap-4 bg-[#2a1648] text-white transition-shadow hover:bg-[#2a1648] hover:shadow-md sm:flex-row sm:items-center sm:gap-6 ">
        <CardHeader className="sm:flex-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">More about my hobbies</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-4 sm:flex-1 sm:py-4">
          <p className="text-sm text-muted-foreground">
            I enjoy exploring creative interests, learning new things, and finding fresh inspiration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
