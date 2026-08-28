"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleSaved } from "@/app/actions/deals";
import { buttonClass } from "@/components/ui/button";

export function SaveButton({
  dealSlug,
  initialSaved,
}: {
  dealSlug: string;
  initialSaved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useOptimistic(initialSaved);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={saved}
      onClick={() =>
        startTransition(async () => {
          setSaved(!saved);
          await toggleSaved(dealSlug);
        })
      }
      className={buttonClass("secondary", "md")}
    >
      {saved ? (
        <BookmarkCheck className="size-4 text-accent-strong" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
