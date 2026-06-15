import { redirect } from "next/navigation";
import { requireOrgVerifiedPageSession } from "@/lib/auth/pageGuard";
import { getSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  await requireOrgVerifiedPageSession("/profile");
  const session = await getSession();

  if (session) {
    redirect(`/u/${session.username}`);
  } else {
    redirect("/api/auth/github");
  }
}
