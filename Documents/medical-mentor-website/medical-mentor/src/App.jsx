import { useEffect, useState } from "react";
import MedicalMentorApp from "./components/MedicalMentorApp";
import AdminPanel from "./components/AdminPanel";

// Simple hash-based routing. The app itself is the homepage —
// /#/admin is the only other route, for Imran to manage updates.
function getRouteFromHash() {
  const h = window.location.hash.replace("#", "");
  if (h === "/admin") return "admin";
  return "app";
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goTo = (r) => {
    window.location.hash = r === "app" ? "" : `/${r}`;
    setRoute(r);
  };

  if (route === "admin") {
    return <AdminPanel onExit={() => goTo("app")} />;
  }

  return <MedicalMentorApp studentName="Imran" onAdmin={() => goTo("admin")} />;
}
