import { redirect } from "next/navigation";

// The proxy normally handles "/" first; this is the fallback.
export default function Home() {
  redirect("/dashboard");
}
