import { Hero } from "../components/Hero";
import { Journey } from "../components/Journey";
import { Workshops } from "../components/Workshops";
import { WeekReflections } from "../components/WeekReflections";
import { FeaturedStarFall } from "../components/FeaturedStarFall";
import { Evidence } from "../components/Evidence";
import { Sudbury } from "../components/Sudbury";

export function HomePage({ introDone }: { introDone: boolean }) {
  return (
    <>
      <Hero ready={introDone} />
      <Journey />
      <WeekReflections />
      <Workshops />
      <FeaturedStarFall />
      <Evidence />
      <Sudbury />
    </>
  );
}
