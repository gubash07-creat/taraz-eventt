import test from 'node:test';
import assert from 'node:assert/strict';
import { TARAZ_EVENTS } from '../data/eventsData';
import {
  filterEvents,
  recommendEvents,
  validateEarlyAccessForm,
} from './eventsLogic';

test('filterEvents returns all events when category is Все and query is empty', () => {
  const result = filterEvents(TARAZ_EVENTS, 'Все', '');
  assert.equal(result.length, TARAZ_EVENTS.length);
});

test('filterEvents filters by specific category and search text', () => {
  const theatreOnly = filterEvents(TARAZ_EVENTS, 'Театр', '');
  assert.ok(theatreOnly.length >= 1);
  assert.ok(theatreOnly.every((item) => item.category === 'Театр'));

  const venueMatch = filterEvents(TARAZ_EVENTS, 'Все', 'Баласағұн');
  assert.equal(venueMatch.length, 1);
  assert.equal(venueMatch[0]?.id, 'balasagun-symphony');
});

test('recommendEvents prioritizes exact interest and timeSlot matches', () => {
  const recs = recommendEvents(TARAZ_EVENTS, 'art', 'Сегодня', 3);
  assert.equal(recs.length, 3);
  assert.equal(recs[0]?.event.id, 'asyl-ceramic-expo');
  assert.equal(recs[0]?.matchType, 'exact');
});

test('validateEarlyAccessForm rejects empty/invalid inputs and accepts valid email or KZ phone', () => {
  const invalidEmpty = validateEarlyAccessForm({
    name: '',
    contact: '',
    favoriteCategory: 'Все',
  });
  assert.equal(invalidEmpty.valid, false);
  assert.ok(invalidEmpty.errors.name);
  assert.ok(invalidEmpty.errors.contact);

  const validEmail = validateEarlyAccessForm({
    name: 'Айгерим',
    contact: 'aigerim@taraz.kz',
    favoriteCategory: 'Концерты',
  });
  assert.equal(validEmail.valid, true);
  assert.equal(validEmail.contactKind, 'email');

  const validPhone = validateEarlyAccessForm({
    name: 'Данияр',
    contact: '+7 (701) 555-22-11',
    favoriteCategory: 'Спорт',
  });
  assert.equal(validPhone.valid, true);
  assert.equal(validPhone.contactKind, 'phone');
});
