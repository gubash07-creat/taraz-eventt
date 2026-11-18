import type {
  FilterCategory,
  InterestId,
  TarazEvent,
  TimeSlot,
} from '../data/eventsData';

export interface RecommendedEventResult {
  event: TarazEvent;
  reason: string;
  matchType: 'exact' | 'mood' | 'discovery';
}

export interface EarlyAccessInput {
  name: string;
  contact: string;
  favoriteCategory: FilterCategory;
}

export interface EarlyAccessValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    contact?: string;
  };
  contactKind: 'email' | 'phone' | null;
}

export function filterEvents(
  events: TarazEvent[],
  category: FilterCategory,
  searchQuery = ''
): TarazEvent[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return events.filter((event) => {
    const matchesCategory = category === 'Все' || event.category === category;
    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      event.title,
      event.subtitle,
      event.category,
      event.venue,
      event.district,
      event.description,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function recommendEvents(
  events: TarazEvent[],
  interest: InterestId,
  timeSlot: TimeSlot,
  limit = 3
): RecommendedEventResult[] {
  const scored = events.map((event) => {
    const matchesInterest = event.interestTags.includes(interest);
    const matchesTime = event.timeSlot === timeSlot;

    let score = 0;
    let matchType: RecommendedEventResult['matchType'] = 'discovery';
    let reason = `Ритм города: ${event.venue} (${event.dateLabel}, ${event.timeLabel})`;

    if (matchesInterest && matchesTime) {
      score = 3;
      matchType = 'exact';
      reason = `Точное совпадение: ${event.category.toLowerCase()} · ${timeSlot.toLowerCase()} в ${event.venue}`;
    } else if (matchesInterest) {
      score = 2;
      matchType = 'mood';
      reason = `По вашему интересу «${event.category}» — ${event.subtitle.toLowerCase()}`;
    } else if (matchesTime) {
      score = 1;
      matchType = 'discovery';
      reason = `Подходит по времени (${timeSlot.toLowerCase()}) — новое открытие в Таразе`;
    }

    return { event, score, matchType, reason };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ event, matchType, reason }) => ({
    event,
    matchType,
    reason,
  }));
}

export function validateEarlyAccessForm(
  input: EarlyAccessInput
): EarlyAccessValidationResult {
  const errors: EarlyAccessValidationResult['errors'] = {};
  const trimmedName = input.name.trim();
  const trimmedContact = input.contact.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Укажите имя (минимум 2 символа)';
  }

  let contactKind: EarlyAccessValidationResult['contactKind'] = null;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const digitsOnly = trimmedContact.replace(/[\s\-()]/g, '');
  const phonePattern = /^\+?\d{10,15}$/;

  if (!trimmedContact) {
    errors.contact = 'Введите email или номер телефона';
  } else if (emailPattern.test(trimmedContact)) {
    contactKind = 'email';
  } else if (phonePattern.test(digitsOnly)) {
    contactKind = 'phone';
  } else {
    errors.contact = 'Укажите корректный email или телефон (+7...)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    contactKind,
  };
}
