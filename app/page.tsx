import { defaultEvents } from '@/lib/default-events';
import { EventManager } from '@/components/event-manager';

export default function HomePage() {
  return (
    <main className="page">
      <section className="container">
        <h1>Event Manager</h1>
        <p className="subtitle">
          Create, edit, search, filter, and sort events. Data is saved in localStorage.
        </p>
        <EventManager initialEvents={defaultEvents} />
      </section>
    </main>
  );
}
