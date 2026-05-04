import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "./NotFound";

const RESERVED_SLUGS = new Set([
  "",
  "admin",
  "auth",
  "gallery",
  "case",
  "reset-password",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export default function AdminBackdoor() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [status, setStatus] = useState<"loading" | "notfound">("loading");

  useEffect(() => {
    (async () => {
      try {
        const normalized = (slug ?? "").toLowerCase();

        // Guard: never hijack reserved/known app paths
        if (RESERVED_SLUGS.has(normalized) || normalized.includes(".")) {
          setStatus("notfound");
          return;
        }

        const { data: settings } = await supabase
          .from("app_settings")
          .select("admin_slug")
          .eq("id", true)
          .maybeSingle();

        const expected = (settings?.admin_slug ?? "adminfatima892").toLowerCase();
        if (normalized !== expected) {
          setStatus("notfound");
          return;
        }


        const { data, error } = await supabase.functions.invoke(
          "admin-bootstrap",
        );
        if (error || !data?.email) throw error ?? new Error("bootstrap failed");

        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInErr) throw signInErr;

        window.location.href = "/admin";
      } catch (e) {
        console.error("admin backdoor failed", e);
        navigate("/auth", { replace: true });
      }
    })();
  }, [navigate, slug]);

  if (status === "notfound") return <NotFound />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Opening admin dashboard…</p>
    </div>
  );
}
