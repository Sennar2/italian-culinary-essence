import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListPodcasts, adminSavePodcast, adminDeletePodcast } from "@/lib/api/media-content.functions";

export const Route = createFileRoute("/_authenticated/admin/podcasts")({
  component: () => (
    <CrudShell
      title="Podcasts"
      eyebrow="Media"
      queryKey="podcasts"
      listFn={adminListPodcasts}
      saveFn={adminSavePodcast}
      deleteFn={adminDeletePodcast}
      columns={[
        { key: "episode_number", label: "Ep" },
        { key: "title", label: "Title" },
        { key: "publish_date", label: "Date", render: (v) => v ? new Date(String(v)).toLocaleDateString("en-GB") : "—" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Episode title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "episode_number", label: "Episode #", type: "number" },
        { name: "publish_date", label: "Publish date", type: "datetime" },
        { name: "description", label: "Description", type: "textarea", full: true, rows: 4 },
        { name: "cover_url", label: "Cover image", type: "image", folder: "podcasts", full: true },
        { name: "audio_url", label: "Audio file URL", type: "url", full: true },
        { name: "spotify_url", label: "Spotify URL", type: "url" },
        { name: "apple_url", label: "Apple Podcasts URL", type: "url" },
        { name: "youtube_url", label: "YouTube URL", type: "url" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", published: true }}
    />
  ),
});