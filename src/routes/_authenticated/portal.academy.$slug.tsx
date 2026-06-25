import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myModule } from "@/lib/api/portal.functions";
import { saveLessonProgress } from "@/lib/api/academy.functions";
import { useState } from "react";
import { ScormPlayer } from "@/components/portal/ScormPlayer";
import { Check, ChevronLeft, FileText, Video, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/academy/$slug")({
  component: ModulePage,
});

function ModulePage() {
  const { slug } = useParams({ from: "/_authenticated/portal/academy/$slug" });
  const qc = useQueryClient();
  const fn = useServerFn(myModule);
  const saveFn = useServerFn(saveLessonProgress);
  const { data, isLoading, error } = useQuery({ queryKey: ["my-module", slug], queryFn: () => fn({ data: { slug } }) });
  const [activeId, setActiveId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (d: any) => saveFn({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-module", slug] }); qc.invalidateQueries({ queryKey: ["portal-dashboard"] }); qc.invalidateQueries({ queryKey: ["my-academy"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  const d: any = data;
  const mod = d.module;
  const lessons = d.lessons as any[];
  const progress: any[] = d.progress;
  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]));
  const completedCount = progress.filter((p) => p.status === "completed").length;
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const active = activeId ? lessons.find((l) => l.id === activeId) : lessons[0];
  const activeProg = active ? progressMap.get(active.id) : null;

  function markComplete(lessonId: string) {
    save.mutate({ module_id: mod.id, lesson_id: lessonId, status: "completed", score: null, scorm_suspend_data: null });
  }

  return (
    <div className="space-y-8">
      <Link to="/portal/academy" className="inline-flex items-center gap-1 text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold">
        <ChevronLeft className="h-3 w-3" /> All courses
      </Link>
      <header>
        {mod.category && <p className="eyebrow">{mod.category}</p>}
        <h1 className="mt-2 font-display text-3xl">{mod.title}</h1>
        {mod.description && <p className="mt-3 text-sm text-muted-foreground max-w-3xl">{mod.description}</p>}
        <div className="mt-5">
          <div className="h-1.5 bg-secondary"><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{completedCount} / {lessons.length} lessons complete · {pct}%</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="border border-border bg-card">
          {lessons.length === 0 && <p className="p-4 text-sm text-muted-foreground">No lessons published yet.</p>}
          {lessons.map((l, i) => {
            const p = progressMap.get(l.id);
            return (
              <button key={l.id} onClick={() => setActiveId(l.id)} className={`w-full text-left px-4 py-3 border-b border-border flex items-center gap-3 ${active?.id === l.id ? "bg-forest text-cream" : "hover:bg-secondary"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${p?.status === "completed" ? "bg-gold text-forest" : active?.id === l.id ? "bg-cream/20" : "bg-secondary"}`}>
                  {p?.status === "completed" ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-sm">{l.title}</span>
                  <span className={`text-[10px] tracking-[0.18em] uppercase ${active?.id === l.id ? "text-cream/60" : "text-muted-foreground"}`}>{l.kind}</span>
                </span>
              </button>
            );
          })}
        </aside>
        <section className="space-y-6">
          {active ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">{active.title}</h2>
                {activeProg?.status === "completed" ? (
                  <span className="text-[11px] tracking-[0.22em] uppercase text-forest">Completed</span>
                ) : (
                  <button onClick={() => markComplete(active.id)} disabled={save.isPending}
                    className="text-[11px] tracking-[0.22em] uppercase bg-forest text-cream px-4 py-2 hover:bg-forest-deep disabled:opacity-60">
                    Mark complete
                  </button>
                )}
              </div>
              <LessonBody lesson={active} initialSuspend={activeProg?.scorm_suspend_data ?? null}
                onScorm={(p) => save.mutate({ module_id: mod.id, lesson_id: active.id, ...p })} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a lesson to begin.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function LessonBody({ lesson, initialSuspend, onScorm }: { lesson: any; initialSuspend: string | null; onScorm: (p: { status: "in_progress" | "completed"; score: number | null; scorm_suspend_data: string | null }) => void }) {
  if (lesson.kind === "video" && lesson.video_url) {
    return (
      <div className="aspect-video bg-black">
        <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    );
  }
  if (lesson.kind === "pdf" && lesson.pdf_url) {
    return (
      <div className="border border-border bg-card">
        <iframe src={lesson.pdf_url} title={lesson.title} className="w-full h-[720px]" />
        <div className="p-3 text-right"><a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold"><FileText className="inline h-3 w-3 mr-1" />Download</a></div>
      </div>
    );
  }
  if (lesson.kind === "scorm") {
    const url = lesson.scorm_launch_url;
    if (!url) return <p className="text-sm text-muted-foreground border border-dashed border-border p-6">SCORM package not yet configured. The admin can paste a launch URL in the lesson editor.</p>;
    return <ScormPlayer launchUrl={url} initialSuspendData={initialSuspend} onProgress={(p) => onScorm({ ...p, scorm_suspend_data: p.suspend_data })} />;
  }
  if (lesson.kind === "text" && lesson.body) {
    return <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">{lesson.body}</article>;
  }
  return <p className="text-sm text-muted-foreground border border-dashed border-border p-6 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Lesson content coming soon.</p>;
}

// silence unused import warning
void Video;