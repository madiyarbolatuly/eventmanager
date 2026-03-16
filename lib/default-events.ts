import type { EventItem } from './types';

export const defaultEvents: EventItem[] = [
  {
    id: 1,
    title: 'Tech Conference 2025',
    description: 'Annual tech conference on AI and ML',
    date: '2027-05-15T10:00:00',
    category: 'Conference',
    status: 'Planned',
    isFavorite: false,
  },
  {
    id: 2,
    title: 'Team Meetup',
    description: 'Monthly team sync meeting',
    date: '2027-04-30T14:00:00',
    category: 'Meeting',
    status: 'Completed',
    isFavorite: true,
  },
  {
    id: 3,
    title: 'Frontend Webinar',
    description: 'Best practices for performance optimization',
    date: '2027-06-07T18:30:00',
    category: 'Webinar',
    status: 'Planned',
    isFavorite: false,
  },
];
