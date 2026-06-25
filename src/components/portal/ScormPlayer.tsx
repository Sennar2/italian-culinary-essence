import { useEffect, useRef, useState } from "react";

type Props = {
  launchUrl: string;
  initialSuspendData?: string | null;
  onProgress: (p: { status: "in_progress" | "completed"; score: number | null; suspend_data: string | null }) => void;
};

/**
 * SCORM 1.2 host. Exposes window.API on the iframe's parent so that
 * SCORM content using `findAPI` discovers it. Captures LMSSetValue calls
 * and forwards key fields to onProgress.
 *
 * Limitations: SCORM 1.2 single-SCO only. 2004 sequencing not implemented.
 */
export function ScormPlayer({ launchUrl, initialSuspendData, onProgress }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    const data: Record<string, string> = {
      "cmi.core.lesson_status": "incomplete",
      "cmi.core.student_id": "member",
      "cmi.core.student_name": "ICC Member",
      "cmi.suspend_data": initialSuspendData ?? "",
      "cmi.core.score.raw": "",
      "cmi.core.score.max": "100",
      "cmi.core.score.min": "0",
    };
    const api = {
      LMSInitialize: () => "true",
      LMSFinish: () => { commit(); return "true"; },
      LMSGetValue: (k: string) => data[k] ?? "",
      LMSSetValue: (k: string, v: string) => { data[k] = String(v); setTick((t) => t + 1); return "true"; },
      LMSCommit: () => { commit(); return "true"; },
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "",
      LMSGetDiagnostic: () => "",
    };
    function commit() {
      const status = data["cmi.core.lesson_status"];
      const scoreRaw = data["cmi.core.score.raw"];
      const completed = status === "completed" || status === "passed";
      onProgress({
        status: completed ? "completed" : "in_progress",
        score: scoreRaw ? Number(scoreRaw) : null,
        suspend_data: data["cmi.suspend_data"] || null,
      });
    }
    // Make API discoverable to the iframe.
    (window as any).API = api;
    (window as any).API_1484_11 = api; // very small 2004 alias; not full impl
    const onUnload = () => { delete (window as any).API; delete (window as any).API_1484_11; };
    return onUnload;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchUrl]);

  return (
    <div className="border border-border bg-charcoal/5">
      <iframe
        ref={ref}
        src={launchUrl}
        title="SCORM module"
        className="w-full h-[640px]"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}