import { useTils } from '../helpers/queries';

import { EmptyState } from '../components/ui/EmptyState';
import { TilCard } from '../components/TilCard';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';

import { TilDialog } from '../components/TilDialog';

export function Home() {
  const { data: tils, isPending, error } = useTils();

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState variant="error" role="alert">
        <strong>Could not load TILs:</strong> {error.message}
      </EmptyState>
    );
  }

  return (
    <section className="container flex flex-col gap-md">
      <header className="flex flex-row justify-between">
        <h1>TILs</h1>
        <TilDialog>
          <Button variant="accent">Create TIL</Button>
        </TilDialog>
      </header>
      <ul className="stack">
        {tils?.map((til) => (
          <li key={til.id}>
            <TilCard til={til} />
          </li>
        ))}
      </ul>
    </section>
  );
}
