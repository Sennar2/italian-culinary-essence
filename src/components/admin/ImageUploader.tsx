import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminUploadImage } from "@/lib/api/website.functions";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";

type Props = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
  aspect?: string; // tailwind aspect class e.g. "aspect-[4/3]"
  label?: string;
};

export function ImageUploader({ value, onChange, folder = "uploads", aspect = "aspect-[4/3]", label }: Props) {
  const upload = useServerFn(adminUploadImage);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setBusy(true);
    try {
      const data_base64 = await fileToBase64(file);
      const res = await upload({
        data: { filename: file.name, content_type: file.type || "image/jpeg", data_base64, folder },
      });
      onChange(res.url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</p>}
      <div
        className={`relative border border-dashed border-border bg-cream/60 ${aspect} flex items-center justify-center overflow-hidden`}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        {value ? (
          <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground text-xs px-4">
            <ImageIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
            Drag & drop or click upload
          </div>
        )}
        {busy && <div className="absolute inset-0 bg-cream/70 flex items-center justify-center text-xs">Uploading…</div>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-forest text-cream px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60"
        >
          <Upload className="h-3 w-3" /> Upload
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>
      <input
        type="url"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="Or paste image URL"
        className="mt-2 w-full bg-cream border border-border px-3 py-1.5 text-xs focus:outline-none focus:border-gold"
      />
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}