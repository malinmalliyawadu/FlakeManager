import { redirect } from "react-router";

export function loader() {
  return redirect("/dashboard");
}

// This file simply redirects to our dashboard
