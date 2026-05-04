import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBackdoor() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
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
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Opening admin dashboard…</p>
    </div>
  );
}
