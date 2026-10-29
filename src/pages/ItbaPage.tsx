import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { facts } from "./itba/northstar";
import { Moscow, Weighted } from "./itba/Prioritization";
import { RequestFlow } from "./itba/RequestFlow";
import { TraceMatrix } from "./itba/TraceMatrix";
import flowDiagram from "../assets/evidence/northstar-flow.webp";

export function ItbaPage() {
  return (
    <>
      <section id="itba-top" tabIndex={-1} className="relative pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="itba-title">
        <div className="shell">
          <Breadcrumb current="IT Business Analysis" />
          <div className="mt-10 grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 id="itba-title" className="display text-[clamp(52px,8.5vw,128px)]">IT Business Analysis</h1>
              <p className="mt-4 font-display text-2xl font-light tracking-tight text-ivory/80 md:text-3xl">Requirements prioritization and prototyping</p>
            </div>
            <div className="border-l-2 border-violet pl-5 md:col-span-4">
              <Provenance tone="class">Classroom case study</Provenance>
              <p className="mt-2 text-[15px] text-ivory/80">Northstar Services Group is a fictional organization created for BTA1876, Lesson 7. All data comes from the class workbook and slides.</p>
            </div>
          </div>

          {/* The case in one line: the number the whole release is built around. */}
          <div className="mt-16 grid items-end gap-10 border-t border-rule pt-10">
            <div>
              <p className="text-sm text-mist">Time-off requests that need correction today, and the Release 1 target</p>
              <div className="mt-4 flex items-end gap-6">
                <span className="display text-[clamp(72px,12vw,160px)] text-amber">{facts.correctionRate}%</span>
                <span className="mb-[0.6em] text-3xl text-mist" aria-hidden="true">→</span>
                <span className="display text-[clamp(72px,12vw,160px)] text-teal-soft">≤{facts.target}%</span>
              </div>
              <p className="mt-2 text-ivory/80">Business objective: reduce corrections {facts.window}.</p>
            </div>
            <Facts items={[["Employees", `About ${facts.employees}`], ["Release 1", "Employee Services Hub"], ["Requirements", "22 in 8 groups"], ["Session", "Oct 22, week 2"]]} />
          </div>
          <p className="mt-10 max-w-measure text-ivory/80">
            Service information is scattered across systems, PDFs, forms and email. Release 1 is a responsive Hub with guided
            time-off requests, validation, supervisor review, tracking, and correction and resubmission.
          </p>
        </div>
      </section>

      <Section id="itba-moscow" title="MoSCoW: what must ship?" intro={<p>Sort the eight feature groups into Must, Should, Could and Won't for Release 1. The decisions already made by the organization are the best evidence.</p>}>
        <Moscow />
        <p className="mt-6 text-sm text-mist">The class workbook leaves these priorities blank on purpose: they were decided in live discussion, so no answers are claimed here.</p>
      </Section>

      <Section id="itba-weighted" title="Weighted scores" intro={<p>A second method turns judgement into numbers: four criteria, each rated 1 to 5, each with a weight. Compare the result with your MoSCoW choices.</p>}>
        <Weighted />
      </Section>

      <Section id="itba-flow" title="The approved request flow" intro={<p>Release 1's process, from Draft to a decision. Play each role and watch which requirements every step satisfies.</p>}>
        <RequestFlow />
        <div className="mt-16 grid items-start gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <figure className="md:col-span-5">
            <img src={flowDiagram} alt="Flowchart of the Northstar time-off request: draft, validation, submission, supervisor assignment, decision, and correction and resubmission." loading="lazy" className="w-full rounded-evidence bg-ivory p-3" />
            <figcaption className="mt-3"><Provenance tone="class">Process diagram from the workshop (not included in the public version)</Provenance></figcaption>
            <Internal></Internal>
          </figure>
          <div className="md:col-span-6 md:col-start-7">
            <h3 className="heading text-2xl">Why prototype?</h3>
            <p className="mt-3 text-ivory/80">“I'll know it when I see it.” People often notice what is missing only when they see a screen. In class, a prototype was treated as an experiment:</p>
            <ol className="mt-5 grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule sm:grid-cols-5">
              {["Ask a question", "Build a prototype", "Test a task", "Record findings", "Refine requirements"].map((s, i) => (
                <li key={s} className="bg-navy p-3 text-sm"><span className="font-display text-violet-soft">{i + 1}</span><p className="mt-1">{s}</p></li>
              ))}
            </ol>
            <p className="mt-5 text-[15px] text-ivory/80">The Northstar test question: can an employee create a request, understand its status, and correct and resubmit a returned request? The three phone screens above answer exactly that task.</p>
            <p className="mt-3 text-sm text-mist">Source: BTA1876 Lesson 7 slides. A prototype complements requirements; it does not replace documented rules.</p>
            <Internal></Internal>
          </div>
        </div>
      </Section>

      <Section id="itba-trace" title="Traceability" intro={<p>Every requirement keeps its ID and links back to the decisions and questions behind it. Filter the register and open any requirement.</p>}>
        <TraceMatrix />
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8">
          <Internal block></Internal>
          <Reflection topic="itba" label="business analysis" />
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
