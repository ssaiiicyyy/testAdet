import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileCard from "@/components/ui/profile-card";
import AccordionGallery from "@/components/AccordionGallery";
import profilePhoto from "../../pfpp.jpg";
import graphicImage from "../../graphic.png";
import frontendImage from "../../frontend.png";
import uiuxImage from "../../uiux.png";
import certificateImage from "../../certificate_Saicy_Marie_De_Vera.png";
import logoImage from "../../logo.png";
import mobileAppImage from "../../mobile app.png";
import gameDevImage from "../../gamedev.png";
import infographicImage from "../../infographic.png";
import presentationImage from "../../presentation.png";
import featuredWorkImage from "../../4604fda8-45b4-48ed-b7d7-fb682871d879.jpg";
import cssImage from "../../css.png";
import canvaImage from "../../canva.png";
import photoshopImage from "../../photoshop.png";
import figmaImage from "../../figma.png";
import htmlImage from "../../html.png";

const skillGroups = [
  {
    title: "Frontend & Design",
    image: graphicImage,
    description:
      "Building responsive, well-structured web pages using HTML, CSS, and JavaScript.",
  },
  {
    title: "Backend & Data",
    image: frontendImage,
    description:
      "Working with server-side tools and databases to support web applications.",
  },
  {
    title: "Ui/Ux Designer",
    image: uiuxImage,
    description:
      "Designing intuitive, accessible user experiences and polished interfaces.",
  },
];

const galleryItems = [
  { image: certificateImage.src, label: "Certificate", link: "#" },
  { image: logoImage.src, label: "Logo", link: "#" },
  { image: mobileAppImage.src, label: "Mobile App", link: "#" },
  { image: gameDevImage.src, label: "Game Development", link: "#" },
  { image: infographicImage.src, label: "Infographic", link: "#" },
  { image: presentationImage.src, label: "Presentation", link: "#" },
  { image: featuredWorkImage.src, label: "Featured Work", link: "#" },
];

const designTools = [
  { name: "CSS", image: cssImage },
  { name: "Canva", image: canvaImage },
  { name: "Photoshop", image: photoshopImage },
  { name: "Figma", image: figmaImage },
  { name: "HTML", image: htmlImage },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-30">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-yellow-400">KNOW ABOUT ME</h1>
        <p className="text-muted-foreground mt-1">
          A bit about my background, passion, and technical skillset.
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
        <Card className="min-h-[450px]">
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed pt-7">
            <p>
              I am a second-year Computer Science student at Naga College Foundation Inc., Naga City, Camarines Sur, Philippines. Passionate about creating engaging, user-centered designs and turning creative ideas into real experiences.
            </p>
            <p>
              I am deeply interested in UI/UX design and frontend development — learning how to craft interfaces that are not only beautiful but also intuitive and accessible to everyone.
            </p>
            <p>
              With a focus on clean architecture and modern user experience, I enjoy
              solving complex engineering problems and continuously learning new tools
              and frameworks.
            </p>
          </CardContent>
        </Card>

        <ProfileCard
          className="md:justify-self-end"
          avatarUrl={profilePhoto}
          name="Saicy Marie F. De Vera"
          title="Computer Science Student"
          handle="saicydevera"
          status="Available"
          contactText="Contact"
          holo={0.8}
          glare={0.5}
          tiltStrength={12}
          radius={16}
          enableTilt
          intro
          showUserInfo
          enableMobileTilt={false}
          theme="dark"
        />
      </div>

      <div className="pt-8 text-right">
        <h2 className="text-2xl font-semibold tracking-tight text-white-400">
          SKILLS AND TECHNOLOGIES
        </h2>
        <p className="mt-1 text-muted-foreground">
          The technologies and tools I use for design and development.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-8 md:grid-cols-3">
        {skillGroups.map((group) => (
          <Card
            key={group.title}
            className="h-full bg-[#2a1648] text-white transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.03] hover:rounded-3xl hover:bg-[#38205f] hover:shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
          >
            {group.image && (
              <div className="px-6 pt-6">
                <Image
                  src={group.image}
                  alt={`${group.title} illustration`}
                  width={48}
                  height={48}
                  className="size-12 object-contain"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {group.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {group.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 py-20 sm:gap-6">
        {designTools.map((tool) => (
          <div
            key={tool.name}
            className="group flex size-20 items-center justify-center rounded-2xl bg-white/5 p-4 shadow-lg transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110 hover:bg-violet-500/15 hover:shadow-[0_12px_30px_rgba(139,92,246,0.25)] sm:size-24"
            title={tool.name}
          >
            <Image
              src={tool.image}
              alt={tool.name}
              width={tool.name === "Figma" ? 112 : 56}
              height={tool.name === "Figma" ? 112 : 56}
              className={`object-contain transition-transform duration-300 group-hover:rotate-3 ${
                tool.name === "Figma" ? "size-24 shrink-0 sm:size-28" : "size-full"
              }`}
            />
          </div>
        ))}
      </div>

      <section className="space-y-4 pt-8">
        <div className="text-right">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            FEATURED WORKS AND PROJECTS
          </h2>
          <p className="mt-1 text-muted-foreground">
            A selection of my creative projects, designs, and achievements.
          </p>
        </div>
        <AccordionGallery
          items={galleryItems}
          defaultIndex={2}
          expandRatio={0.52}
          trigger="hover"
          accentColor="#ffffff"
          overlayColor="#060010"
          textColor="#ffffff"
          grayscale
          showLabels
          duration={0.6}
          ease="power3.out"
          parallax={0.5}
          tilt={8}
          stagger={0.06}
          height={360}
          gap={10}
          radius={16}
          orientation="horizontal"
        />
      </section>

    </div>
  );
}