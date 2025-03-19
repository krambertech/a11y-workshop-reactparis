// import { useTils } from "../helpers/queries";

import { EmptyState } from "../components/ui/EmptyState";

export function Home() {
  // const { data: tils } = useTils();

  return (
    <div className="container flex flex-col gap-md">
      <h1>TILs</h1>
      <EmptyState>This page is under construction.</EmptyState>
    </div>
  );
}
