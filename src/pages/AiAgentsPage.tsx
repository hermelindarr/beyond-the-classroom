import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { AgentLoop, Anatomy, HumanInTheLoop, RagPipelines } from "./ai/diagrams";

// Everything on this page is class material: there is no student work for
// this workshop yet. The page says so up front and keeps the violet tone.

const lectures = [
  { n: 0, title: "Welcome", builds: "The map: what an agent is", activity: null },
  { n: 1, title: "The Boring Gold Mine", builds: "The brain: tokens, embeddings, next-token prediction", activity: "Quiz 1" },
  { n: 2, title: "Giving AI Arms & Legs", builds: "Tools and knowledge: RAG, model APIs, JSON, workflows", activity: "Quiz 2" },
  { n: 3, title: "Muscles & Memory", builds: "Autonomy: tasks, memory, MCP", activity: "Task 3" },
  { n: 4, title: "Floki the Builder", builds: "A team of agents: ReAct, supervisors, human in the loop, budgets", activity: "Task 4" },
];

export function AiAgentsPage() {
  return (
    <>
      <section id="ai-top" tabIndex={-1} className="relative pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="ai-title">
        <div className="shell">
          <Breadcrumb current="AI Agents" />
          <div className="mt-10 grid items-end gap-10 md:grid-cols-12">
            <h1 id="ai-title" className="display text-[clamp(60px,11vw,168px)] md:col-span-8">AI Agents</h1>
            <div className="border-l-2 border-violet pl-5 md:col-span-4">
              <Provenance tone="class">Class material only</Provenance>
              <p className="mt-2 text-[15px] text-ivory/80">This page explains what the workshop covered. None of my own work is shown here yet.</p>
            </div>
          </div>

          <figure className="mt-14 grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule md:grid-cols-2">
            <div className="bg-navy p-6 md:p-8">
              <p className="text-sm text-mist">Chatbot</p>
              <p className="mt-3 font-display text-xl tracking-tight">“Book me a flight to Monterrey on Friday.”</p>
              <p className="mt-3 text-ivory/70">Replies with steps: open an airline website, search, pick a flight and pay.</p>
              <p className="mt-4 text-sm text-mist">You still do all the work.</p>
            </div>
            <div className="bg-navy p-6 md:p-8">
              <p className="text-sm text-violet-soft">Agent</p>
              <ol className="mt-3 space-y-1.5 text-ivory/85">
                <li>Searches Friday flights to Monterrey</li>
                <li>Compares price, time and layovers</li>
                <li>Asks: “Book the 9:40 AM option?”</li>
                <li>Books it and emails the ticket</li>
              </ol>
              <p className="mt-4 text-sm text-mist">The work gets done.</p>
            </div>
            <figcaption className="bg-navy px-6 pb-5 text-sm text-mist md:col-span-2 md:px-8">“A chatbot talks. An agent acts.” — Lecture 0</figcaption>
          </figure>

          <div className="mt-12">
            <Facts items={[["Date", "Oct 26, week 3"], ["Instructor", "Hasan Shahriar"], ["Format", "Five short lectures"], ["Activities", "Two quizzes, two tasks"]]} />
          </div>
        </div>
      </section>

      <Section id="ai-loop" title="The agent loop" intro={<p>Every agent runs the same heartbeat: think, act, observe, and repeat until the goal is met. Step through the example from class.</p>}>
        <AgentLoop />
      </Section>

      <Section id="ai-anatomy" title="Anatomy of an agent" intro={<p>The workshop built an agent part by part. Each part around the brain was the topic of one lecture.</p>}>
        <Anatomy />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule md:grid-cols-5">
          {lectures.map((l) => (
            <li key={l.n} className="bg-navy p-5">
              <p className="font-display text-sm text-violet-soft">Lecture {l.n}</p>
              <p className="mt-2 font-display text-lg font-semibold leading-tight tracking-tight">{l.title}</p>
              <p className="mt-2 text-sm text-ivory/70">{l.builds}</p>
              {l.activity && <p className="mt-3 text-sm text-mist">Then: {l.activity}</p>}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="ai-rag" title="RAG: open-book answers" intro={<p>A model on its own answers from memory, like a closed-book exam. Retrieval-augmented generation lets it look up the right pages first.</p>}>
        <RagPipelines />
      </Section>

      <Section id="ai-human" title="Human in the loop" intro={<p>The class project was an AI assistant for a bank. The riskier the action, the more a person has to approve it. Pick a request.</p>}>
        <HumanInTheLoop />
        <p className="mt-10 text-sm text-mist">All diagrams are redrawn from the lecture slides by Hasan Shahriar, Cambrian College. Examples and wording follow the slides.</p>
        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6"><Internal block></Internal></div>
          <div className="md:col-span-6"><Reflection topic="ai-agents" label="AI agents" /></div>
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
