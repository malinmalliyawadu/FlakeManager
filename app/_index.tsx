import { redirect } from "@remix-run/node";

export function loader() {
  return redirect("/dashboard");
}

// This file simply redirects to our dashboard
