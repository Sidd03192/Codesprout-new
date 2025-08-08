import React from "react";
import { Sparkles, GraduationCap, Clock, Shield } from "lucide-react";

export const Bento = () => {
  return (
    <section id="overview" className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <article className="card-glass md:col-span-4 flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-primary" />
              <h3 className="font-heading text-xl font-semibold">
                AI that coaches, not replaces
              </h3>
            </div>
            <p className="text-muted-foreground">
              Instant hints and explanations help students learn concepts while
              you focus on teaching.
            </p>
          </article>

          <article className="card-glass md:col-span-2 min-h-[220px]">
            <div className="flex items-center gap-3 mb-3">
              <Clock />
              <h3 className="font-heading text-lg font-semibold">
                Save hours weekly
              </h3>
            </div>
            <p className="text-muted-foreground">
              Automated practice and feedback reduce grading and rework.
            </p>
          </article>

          <article className="card-glass md:col-span-2 min-h-[240px]">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap />
              <h3 className="font-heading text-lg font-semibold">
                Built for classrooms
              </h3>
            </div>
            <p className="text-muted-foreground">
              Standards-aligned content with visibility into progress and
              coverage.
            </p>
          </article>

          <article className="card-glass md:col-span-4 min-h-[240px] bg-[linear-gradient(var(--gradient-brand))] text-[hsl(var(--brand-contrast))]">
            <div className="flex items-center gap-3 mb-3">
              <Shield />
              <h3 className="font-heading text-xl font-semibold">
                Safe by design
              </h3>
            </div>
            <p className="opacity-90">
              Admin controls, content filters, and audit logs keep learning
              compliant.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Bento;
