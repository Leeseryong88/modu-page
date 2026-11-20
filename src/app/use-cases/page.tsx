import { redirect } from "next/navigation";

// Preserve bookmarks while keeping discovery inside the landing page.
export default function Page() { redirect("/#examples"); }
