import { Suspense } from "react";
import AdminRoundScoring from "./AdminRoundScoring";

export default function AdminScoringRoundPage(props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-foreground/70">Loading...</p>
        </div>
      }
    >
      <AdminRoundScoring params={props.params} />
    </Suspense>
  );
}
