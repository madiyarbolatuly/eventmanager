'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  type EventCategory,
  type EventItem,
  type EventStatus,
  type SortDirection,
  type SortField,
} from '@/lib/types';

const STORAGE_KEY = 'event-manager-events';

type EventFormState = {
  title: string;
  description: string;
  date: string;
  category: EventCategory;
  status: EventStatus;
};

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  date: '',
  category: 'Conference',
  status: 'Planned',
};

function sortEvents(items: EventItem[], field: SortField, direction: SortDirection): EventItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === 'title') {
      return a.title.localeCompare(b.title);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

function validateForm(form: EventFormState): string | null {
  if (!form.title.trim()) return 'Title is required.';
  if (!form.date) return 'Date and time are required.';
  if (new Date(form.date).getTime() < Date.now()) return 'Date cannot be in the past.';
  return null;
}

export function EventManager({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | EventCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as EventItem[];
      if (Array.isArray(parsed)) setEvents(parsed);
    } catch {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const visibleEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = events.filter((event) => {
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesFavorite = !showFavoritesOnly || event.isFavorite;
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesStatus && matchesFavorite && matchesSearch;
    });

    return sortEvents(filtered, sortField, sortDirection);
  }, [events, categoryFilter, statusFilter, search, sortField, sortDirection, showFavoritesOnly]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (editingId === null) {
      setEvents((prev) => [
        ...prev,
        { ...form, id: Date.now(), isFavorite: false, title: form.title.trim(), description: form.description.trim() },
      ]);
    } else {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
              }
            : item,
        ),
      );
      setEditingId(null);
    }

    setForm(EMPTY_FORM);
  };

  const startEdit = (event: EventItem) => {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      category: event.category,
      status: event.status,
    });
    setEditingId(event.id);
    setError(null);
  };

  const removeEvent = (id: number) => {
    if (!window.confirm('Delete this event?')) return;
    setEvents((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  };

  const exportAsJson = () => {
    const payload = JSON.stringify({ events }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'events.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-manager">
      <form onSubmit={submit} className="panel form-grid">
        <h2>{editingId === null ? 'Add event' : 'Edit event'}</h2>
        <label>
          Title *
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
        </label>
        <label>
          Date and time *
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          />
        </label>
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as EventCategory }))}>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button type="submit">{editingId === null ? 'Add event' : 'Save changes'}</button>
          {editingId !== null ? (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="panel controls">
        <h2>Filters and sorting</h2>
        <label>
          Search
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="By title or description" />
        </label>
        <label>
          Category
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}>
            <option value="all">All</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All</option>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort field
          <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
        </label>
        <label>
          Sort direction
          <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value as SortDirection)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
          />
          Favorites only
        </label>
        <button onClick={exportAsJson} className="secondary">Export JSON</button>
      </div>

      <div className="panel">
        <h2>Events ({visibleEvents.length})</h2>
        <div className="cards">
          {visibleEvents.map((event) => (
            <article key={event.id} className="card">
              <header>
                <h3>{event.title}</h3>
                <button
                  className="icon-button"
                  onClick={() =>
                    setEvents((prev) => prev.map((item) => (item.id === event.id ? { ...item, isFavorite: !item.isFavorite } : item)))
                  }
                  aria-label="Toggle favorite"
                >
                  {event.isFavorite ? '★' : '☆'}
                </button>
              </header>
              <p>{event.description || 'No description provided.'}</p>
              <ul>
                <li><strong>Date:</strong> {new Date(event.date).toLocaleString()}</li>
                <li><strong>Category:</strong> {event.category}</li>
                <li><strong>Status:</strong> {event.status}</li>
              </ul>
              <div className="actions">
                <button onClick={() => startEdit(event)}>Edit</button>
                <button onClick={() => removeEvent(event.id)} className="danger">Delete</button>
              </div>
            </article>
          ))}
          {visibleEvents.length === 0 ? <p>No events found.</p> : null}
        </div>
      </div>
    </div>
  );
}
