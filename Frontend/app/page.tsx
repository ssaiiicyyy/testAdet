import Link from "next/link";
import TechText from "@/components/TechText";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 pt-30">
      <div className="mb-[-2rem] h-20 w-full max-w-5xl translate-x-4 text-white/90 sm:translate-x-8">
        <TechText
          text="HELLO, I AM"
          fontWeight={600}
          fontSize={150}
          reveal="letter"
          dashLength={4}
          dashGap={2}
          specks={15}
          intro="none"
          introDuration={2}
          clickKick
          guides={false}
          fontFamily=""
          letterSpacing={-0.05}
          accentColor="currentColor"
          reach={200}
          softness={0.7}
          lineStyle="dashed"
          strokeWidth={1.5}
          speed={1}
          bounce={0.4}
          selection
          labels
          color="currentColor"
          align="left"
          draggable
          sweep
          style={{}}
        />
      </div>
      <div className="hero-name px-4 py-8 text-center text-[clamp(4rem,24vw,300px)] font-bold leading-none">
        SAICY
      </div>
      <div className="max-w-3xl space-y-2 text-center text-sm text-white/90 sm:text-base">
        <p>A Second Year Computer Science student at Naga College Foundation, Inc.</p>
        <p>An aspiring UI/UX Designer and Frontend Developer.</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
      
        <Link
          href="/about"
          className="rounded-full border border-violet-300/20 bg-violet-950/80 px-6 py-3 text-sm font-medium text-white shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-[20px] transition hover:border-violet-200/40 hover:bg-violet-900"
        >
          View My Projects
        </Link>
      </div>
    </main>
  );
}
