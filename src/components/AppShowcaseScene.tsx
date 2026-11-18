import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Compass,
  Heart,
  MapPin,
  Search,
  Ticket,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CATEGORIES,
  REFERENCE_APP_IMAGE,
  type EventCategory,
  type FilterCategory,
  type TarazEvent,
} from '../data/eventsData';
import { filterEvents } from '../utils/eventsLogic';

gsap.registerPlugin(ScrollTrigger);

export type PhoneTab =
  | 'launch'
  | 'interests'
  | 'feed'
  | 'detail'
  | 'favorites'
  | 'tickets';

interface AppShowcaseSceneProps {
  events: TarazEvent[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  phoneTab: PhoneTab;
  onPhoneTabChange: (tab: PhoneTab) => void;
  manualTriggerVersion: number;
  favoriteIds: string[];
  onToggleFavorite: (eventId: string) => void;
  ticketIds: string[];
  onReserveTicket: (eventId: string) => void;
}

const APP_CHAPTERS: {
  num: string;
  tab: PhoneTab;
  title: string;
  caption: string;
}[] = [
  {
    num: '01',
    tab: 'launch',
    title: 'Первый запуск',
    caption: 'Фирменное приветствие Тараза',
  },
  {
    num: '02',
    tab: 'interests',
    title: 'Выбор интересов',
    caption: 'Персональный тон вашей ленты',
  },
  {
    num: '03',
    tab: 'feed',
    title: 'Каталог мероприятий',
    caption: 'Живой поиск и категории',
  },
  {
    num: '04',
    tab: 'detail',
    title: 'Карточка события',
    caption: 'Сцена, время и избранное',
  },
  {
    num: '05',
    tab: 'tickets',
    title: 'Демонстрационный билет',
    caption: 'Макет цифрового пропуска',
  },
];

const PHONE_INTEREST_CATEGORIES: EventCategory[] = [
  'Концерты',
  'Театр',
  'Стендап',
  'Спорт',
  'Выставки',
  'Фестивали',
];

export function AppShowcaseScene({
  events,
  selectedEventId,
  onSelectEvent,
  phoneTab,
  onPhoneTabChange,
  manualTriggerVersion,
  favoriteIds,
  onToggleFavorite,
  ticketIds,
  onReserveTicket,
}: AppShowcaseSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinStageRef = useRef<HTMLDivElement>(null);
  const morphPhotoRef = useRef<HTMLDivElement>(null);
  const morphTextRef = useRef<HTMLDivElement>(null);
  const phoneStageRef = useRef<HTMLDivElement>(null);
  const hudRailRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const manualLockUntilRef = useRef<number>(0);

  const [phoneCategory, setPhoneCategory] = useState<FilterCategory>('Все');
  const [selectedInterests, setSelectedInterests] = useState<EventCategory[]>([
    'Концерты',
    'Театр',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneLang, setPhoneLang] = useState<'RU' | 'KZ'>('RU');

  const selectedEvent =
    events.find((e) => e.id === selectedEventId) ?? events[0];
  const baseFeedEvents = filterEvents(events, phoneCategory, searchQuery);
  const visibleFeedEvents =
    phoneCategory === 'Все' &&
    !searchQuery.trim() &&
    selectedInterests.length > 0
      ? [
          ...baseFeedEvents.filter((e) =>
            selectedInterests.includes(e.category)
          ),
          ...baseFeedEvents.filter(
            (e) => !selectedInterests.includes(e.category)
          ),
        ]
      : baseFeedEvents;

  const favoriteEvents = events.filter((e) => favoriteIds.includes(e.id));
  const ticketEvents = events.filter((e) => ticketIds.includes(e.id));

  // Signature Scroll Transition: Full-screen event image shrinks and transforms into the smartphone card!
  useEffect(() => {
    if (!sectionRef.current || !pinStageRef.current) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinStageRef.current,
            start: 'top top',
            end: '+=1500',
            pin: true,
            scrub: 0.75,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (Date.now() < manualLockUntilRef.current) return;
              const p = self.progress;
              if (p < 0.45) {
                onPhoneTabChange('detail');
              } else if (p < 0.58) {
                onPhoneTabChange('launch');
              } else if (p < 0.71) {
                onPhoneTabChange('interests');
              } else if (p < 0.84) {
                onPhoneTabChange('feed');
              } else if (p < 0.93) {
                onPhoneTabChange('detail');
              } else {
                onPhoneTabChange('tickets');
              }
            },
          },
        });

        scrollTriggerRef.current = tl.scrollTrigger ?? null;

        // 0% -> 46%: Full-bleed event photograph shrinks into smartphone card dimensions
        if (morphPhotoRef.current && morphTextRef.current) {
          tl.to(
            morphTextRef.current,
            {
              opacity: 0,
              y: -36,
              duration: 0.2,
              ease: 'power2.in',
            },
            0
          )
            .fromTo(
              morphPhotoRef.current,
              {
                scale: 1,
                borderRadius: '0px',
                y: 0,
              },
              {
                scale: 0.24,
                borderRadius: '44px',
                y: -64,
                duration: 0.46,
                ease: 'power2.inOut',
              },
              0.04
            )
            .to(
              morphPhotoRef.current,
              {
                opacity: 0,
                duration: 0.14,
                ease: 'power1.out',
              },
              0.42
            );
        }

        // Smartphone chassis rises & wraps around the landing photo
        if (phoneStageRef.current) {
          tl.fromTo(
            phoneStageRef.current,
            { scale: 0.86, opacity: 0, y: 36 },
            { scale: 1, opacity: 1, y: 0, duration: 0.34, ease: 'power3.out' },
            0.14
          );
        }

        // Flanking chapter HUD & live state rail fade in cleanly
        if (hudRailRef.current) {
          tl.fromTo(
            hudRailRef.current,
            { opacity: 0.25, y: 20 },
            { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
            0.32
          );
        }

        // Hold & step smoothly through chapters 0.5 -> 1.0
        tl.to({}, { duration: 0.45 }, 0.55);
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      scrollTriggerRef.current = null;
    };
  }, [onPhoneTabChange]);

  // When user clicks "В приложении" from Hero / Gallery / AI Guide, land straight on settled interactive phone!
  useEffect(() => {
    if (manualTriggerVersion === 0) return;
    manualLockUntilRef.current = Date.now() + 2600;

    if (scrollTriggerRef.current && window.innerWidth >= 1024) {
      const targetScroll = scrollTriggerRef.current.start + 950;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [manualTriggerVersion]);

  const selectChapterManually = (tab: PhoneTab) => {
    manualLockUntilRef.current = Date.now() + 2800;
    onPhoneTabChange(tab);
    if (scrollTriggerRef.current && window.innerWidth >= 1024) {
      const st = scrollTriggerRef.current;
      if (window.scrollY < st.start + 720) {
        window.scrollTo({ top: st.start + 880, behavior: 'smooth' });
      }
    }
  };

  const openEventDetail = (eventId: string) => {
    manualLockUntilRef.current = Date.now() + 2800;
    onSelectEvent(eventId);
    onPhoneTabChange('detail');
  };

  const toggleInterestChip = (cat: EventCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  return (
    <section
      id="app-showcase"
      ref={sectionRef}
      className="scroll-mt-16 relative border-y border-[#2C2021]/8 bg-[#FBF1F3]"
    >
      {/* Pinned Signature Transition Stage (Desktop: full-screen image morphs into smartphone card) */}
      <div
        ref={pinStageRef}
        className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden py-14 lg:h-screen lg:py-0"
      >
        {/* Full-Bleed Event Photo Layer that transforms into the Smartphone Card on desktop scroll */}
        <div
          ref={morphPhotoRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden bg-[#2C2021] lg:block will-change-transform"
        >
          <img
            src={selectedEvent.image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2021]/88 via-[#2C2021]/30 to-[#2C2021]/25" />

          <div
            ref={morphTextRef}
            className="absolute inset-x-0 bottom-16 mx-auto max-w-5xl px-8 text-[#FEFEFF]"
          >
            <p className="text-xs font-semibold tracking-[0.2em] text-[#FFEDE9] uppercase">
              03. Внутри интерфейса · {selectedEvent.category}
            </p>
            <h2 className="font-display mt-3 text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[1.03]">
              {selectedEvent.title}
            </h2>
            <p className="mt-3 text-base text-[#FFF8F8]/85">
              Прокрутите вниз — живая сцена города переходит прямо в экран
              приложения TARAZ EVENTS.
            </p>
          </div>
        </div>

        {/* Settled Interactive Smartphone & Editorial Step HUD */}
        <div
          ref={hudRailRef}
          className="relative z-10 mx-auto w-full max-w-[1340px] px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Architectural Chapter Rail */}
            <div className="order-2 lg:order-1 lg:col-span-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#BE0022] uppercase">
                03. Сценарий приложения
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold leading-tight text-[#2C2021]">
                От кадра города — к билету в кармане
              </h2>

              <div className="mt-6 space-y-1.5">
                {APP_CHAPTERS.map((chap) => {
                  const active = phoneTab === chap.tab;
                  return (
                    <button
                      key={chap.tab}
                      type="button"
                      onClick={() => selectChapterManually(chap.tab)}
                      className={`flex w-full items-baseline justify-between gap-3 rounded-2xl border-b border-[#2C2021]/10 px-4 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#BE0022] ${
                        active
                          ? 'bg-[#FEFEFF] taraz-card-shadow'
                          : 'bg-transparent opacity-75 hover:bg-[#FEFEFF]/60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <span
                          className={`font-mono text-xs font-semibold tabular-nums ${
                            active ? 'text-[#BE0022]' : 'text-[#6E595B]'
                          }`}
                        >
                          {chap.num}
                        </span>
                        <span className="font-display text-base font-bold text-[#2C2021]">
                          {chap.title}
                        </span>
                      </div>
                      <span className="hidden text-xs text-[#6E595B] sm:inline">
                        {chap.caption}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Interactive Smartphone */}
            <div
              ref={phoneStageRef}
              className="order-1 flex justify-center lg:order-2 lg:col-span-4"
            >
              <div className="w-full max-w-[330px] rounded-[2.6rem] border-[6px] border-[#2C2021] bg-[#2C2021] px-1.5 pb-1.5 pt-2.5 taraz-phone-shadow">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-2 flex w-16 items-center justify-center gap-1.5"
                >
                  <span className="h-1 w-8 rounded-full bg-[#FEFEFF]/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FEFEFF]/25" />
                </div>

                <div className="relative flex h-[590px] flex-col overflow-hidden rounded-[2rem] bg-[#FFF8F8]">
                  {phoneTab !== 'launch' && (
                    <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEFEFF] px-3 py-1.5 text-xs font-semibold text-[#2C2021] shadow-xs">
                        <MapPin
                          className="h-3.5 w-3.5 text-[#BE0022]"
                          aria-hidden="true"
                        />
                        <span>Тараз, Қазақстан</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPhoneLang((prev) => (prev === 'RU' ? 'KZ' : 'RU'))
                        }
                        aria-label="Переключить язык интерфейса в приложении"
                        className="rounded-full bg-[#FEFEFF] px-2.5 py-1.5 text-xs font-semibold text-[#2C2021] shadow-xs transition-colors hover:bg-[#FFEDE9]"
                      >
                        {phoneLang}
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 pb-3">
                    {phoneTab === 'launch' && (
                      <div className="-mx-4 relative h-full min-h-[520px] bg-[#FFF8F8]">
                        <img
                          src={REFERENCE_APP_IMAGE}
                          alt="Экран первого запуска TARAZ EVENTS"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-top"
                        />
                        <button
                          type="button"
                          onClick={() => selectChapterManually('interests')}
                          aria-label="Продолжить к выбору интересов в приложении"
                          className="absolute inset-x-4 bottom-[9%] h-12 rounded-2xl border border-[#FEFEFF]/30 bg-transparent transition-colors hover:bg-[#FEFEFF]/12"
                        />
                      </div>
                    )}

                    {phoneTab === 'interests' && (
                      <div className="flex h-full flex-col justify-between pt-2">
                        <div>
                          <p className="text-[11px] font-semibold text-[#BE0022]">
                            Шаг 1 из 1 · Персонализация
                          </p>
                          <h3 className="font-display mt-1.5 text-2xl font-bold leading-tight text-[#2C2021]">
                            Что вам интересно в{' '}
                            <span className="text-[#BE0022]">Таразе</span>?
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-[#6E595B]">
                            Выберите направления — афиша выстроит их в начало
                            ленты.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {PHONE_INTEREST_CATEGORIES.map((cat) => {
                              const selected = selectedInterests.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => toggleInterestChip(cat)}
                                  className={`rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                                    selected
                                      ? 'border-[#BE0022] bg-[#BE0022] text-[#FEFEFF] shadow-xs'
                                      : 'border-[#2C2021]/8 bg-[#FFEDE9] text-[#2C2021] hover:bg-[#FBF1F3]'
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => selectChapterManually('feed')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BE0022] py-3 text-xs font-semibold text-[#FEFEFF] transition-colors hover:bg-[#9E001C]"
                          >
                            <span>
                              Показать афишу ({selectedInterests.length})
                            </span>
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {phoneTab === 'feed' && (
                      <div>
                        <h3 className="font-display mt-1 text-2xl font-bold text-[#2C2021]">
                          {phoneLang === 'RU' ? 'Мероприятия ' : 'Іс-шаралар '}
                          <span className="text-[#BE0022]">Тараз</span>
                        </h3>

                        <div className="relative mt-3">
                          <label
                            htmlFor="phone-event-search"
                            className="sr-only"
                          >
                            Поиск событий в Таразе
                          </label>
                          <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E595B]"
                            aria-hidden="true"
                          />
                          <input
                            id="phone-event-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                              phoneLang === 'RU'
                                ? 'Поиск концерта или места...'
                                : 'Іздеу...'
                            }
                            className="w-full rounded-xl border border-[#2C2021]/10 bg-[#FEFEFF] py-2.5 pl-9 pr-3 text-xs text-[#2C2021] placeholder:text-[#6E595B]/70 focus:border-[#BE0022] focus:outline-none"
                          />
                        </div>

                        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                          {CATEGORIES.map((cat) => {
                            const active = phoneCategory === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setPhoneCategory(cat)}
                                className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                  active
                                    ? 'bg-[#BE0022] text-[#FEFEFF]'
                                    : 'bg-[#FFEDE9] text-[#2C2021] hover:bg-[#FBF1F3]'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-3 space-y-2.5">
                          {visibleFeedEvents.length === 0 ? (
                            <div className="rounded-2xl bg-[#FEFEFF] p-5 text-center">
                              <p className="text-xs font-semibold text-[#2C2021]">
                                Ничего не найдено
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery('');
                                  setPhoneCategory('Все');
                                }}
                                className="mt-3 rounded-lg bg-[#FFEDE9] px-3 py-1.5 text-xs font-semibold text-[#BE0022]"
                              >
                                Сбросить фильтры
                              </button>
                            </div>
                          ) : (
                            visibleFeedEvents.map((ev) => {
                              const isFav = favoriteIds.includes(ev.id);
                              return (
                                <div
                                  key={ev.id}
                                  className="flex items-center gap-2.5 rounded-2xl border border-[#2C2021]/6 bg-[#FEFEFF] p-2.5 shadow-xs"
                                >
                                  <button
                                    type="button"
                                    onClick={() => openEventDetail(ev.id)}
                                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                  >
                                    <img
                                      src={ev.image}
                                      alt={ev.imageAlt}
                                      referrerPolicy="no-referrer"
                                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-semibold text-[#BE0022]">
                                        {ev.category} · {ev.dateLabel}
                                      </p>
                                      <p className="truncate text-xs font-bold text-[#2C2021]">
                                        {ev.title}
                                      </p>
                                      <p className="mt-0.5 truncate text-[11px] text-[#6E595B]">
                                        {ev.venue} · {ev.priceLabel}
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onToggleFavorite(ev.id)}
                                    aria-pressed={isFav}
                                    aria-label={
                                      isFav
                                        ? `Удалить ${ev.title} из избранного`
                                        : `Сохранить ${ev.title} в избранное`
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF8F8] text-[#2C2021] hover:bg-[#FFEDE9]"
                                  >
                                    <Heart
                                      className={`h-3.5 w-3.5 ${
                                        isFav
                                          ? 'fill-[#BE0022] text-[#BE0022]'
                                          : 'text-[#6E595B]'
                                      }`}
                                    />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {phoneTab === 'detail' && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => selectChapterManually('feed')}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#2C2021] hover:bg-[#FFEDE9]"
                        >
                          <ArrowLeft
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span>
                            {phoneLang === 'RU' ? 'К афише' : 'Афишаға'}
                          </span>
                        </button>

                        <div className="mt-2 overflow-hidden rounded-2xl bg-[#FEFEFF] shadow-xs">
                          <div className="relative aspect-[16/10] w-full bg-[#FFEDE9]">
                            <img
                              src={selectedEvent.image}
                              alt={selectedEvent.imageAlt}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-3.5">
                            <p className="text-[11px] font-semibold text-[#BE0022]">
                              {selectedEvent.category} ·{' '}
                              {selectedEvent.dateLabel},{' '}
                              {selectedEvent.timeLabel}
                            </p>
                            <h4 className="font-display mt-1 text-lg font-bold leading-snug text-[#2C2021]">
                              {selectedEvent.title}
                            </h4>
                            <p className="mt-1 text-xs text-[#6E595B]">
                              {selectedEvent.venue} · {selectedEvent.district}
                            </p>
                            <p className="mt-2.5 text-xs leading-relaxed text-[#2C2021]/85">
                              {selectedEvent.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#6E595B]">
                              {selectedEvent.highlights.map((item, idx) => (
                                <span key={item}>
                                  {idx > 0 && '· '}
                                  {item}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  manualLockUntilRef.current =
                                    Date.now() + 2500;
                                  onReserveTicket(selectedEvent.id);
                                }}
                                className="flex-1 rounded-xl bg-[#BE0022] px-3 py-2.5 text-xs font-semibold text-[#FEFEFF] transition-colors hover:bg-[#9E001C]"
                              >
                                {ticketIds.includes(selectedEvent.id)
                                  ? 'Открыть демо-билет'
                                  : `Демо-билет · ${selectedEvent.priceLabel}`}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  onToggleFavorite(selectedEvent.id)
                                }
                                aria-pressed={favoriteIds.includes(
                                  selectedEvent.id
                                )}
                                aria-label="Добавить событие в избранное"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2C2021]/10 bg-[#FFF8F8]"
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    favoriteIds.includes(selectedEvent.id)
                                      ? 'fill-[#BE0022] text-[#BE0022]'
                                      : 'text-[#2C2021]'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {phoneTab === 'favorites' && (
                      <div className="pt-1">
                        <h3 className="font-display text-xl font-bold text-[#2C2021]">
                          {phoneLang === 'RU' ? 'Избранное' : 'Таңдаулылар'}
                        </h3>
                        <p className="mt-1 text-xs text-[#6E595B]">
                          События, которые вы отметили для похода.
                        </p>

                        {favoriteEvents.length === 0 ? (
                          <div className="mt-4 rounded-2xl bg-[#FEFEFF] p-5 text-center">
                            <p className="text-xs font-semibold text-[#2C2021]">
                              Список пока пуст
                            </p>
                            <button
                              type="button"
                              onClick={() => selectChapterManually('feed')}
                              className="mt-3 rounded-xl bg-[#BE0022] px-4 py-2 text-xs font-semibold text-[#FEFEFF]"
                            >
                              Перейти к афише
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2.5">
                            {favoriteEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="flex items-center gap-2.5 rounded-2xl bg-[#FEFEFF] p-2.5 shadow-xs"
                              >
                                <button
                                  type="button"
                                  onClick={() => openEventDetail(ev.id)}
                                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                >
                                  <img
                                    src={ev.image}
                                    alt={ev.imageAlt}
                                    referrerPolicy="no-referrer"
                                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-bold text-[#2C2021]">
                                      {ev.title}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] text-[#6E595B]">
                                      {ev.dateLabel} · {ev.venue}
                                    </p>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onToggleFavorite(ev.id)}
                                  aria-label={`Удалить «${ev.title}» из избранного`}
                                  className="rounded-lg bg-[#FFEDE9] px-2 py-1 text-[11px] font-semibold text-[#BE0022]"
                                >
                                  Убрать
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {phoneTab === 'tickets' && (
                      <div className="pt-1">
                        <h3 className="font-display text-xl font-bold text-[#2C2021]">
                          {phoneLang === 'RU'
                            ? 'Демо-билеты'
                            : 'Демо-билеттер'}
                        </h3>
                        <p className="mt-1 text-xs text-[#6E595B]">
                          Макет электронного пропуска (не является покупкой).
                        </p>

                        {ticketEvents.length === 0 ? (
                          <div className="mt-4 rounded-2xl bg-[#FEFEFF] p-5 text-center">
                            <p className="text-xs font-semibold text-[#2C2021]">
                              Нет демо-билетов
                            </p>
                            <button
                              type="button"
                              onClick={() => selectChapterManually('detail')}
                              className="mt-3 rounded-xl bg-[#BE0022] px-4 py-2 text-xs font-semibold text-[#FEFEFF]"
                            >
                              Открыть событие
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-3">
                            {ticketEvents.map((ev, idx) => (
                              <div
                                key={ev.id}
                                className="overflow-hidden rounded-2xl border border-[#2C2021]/8 bg-[#FEFEFF] p-3.5 shadow-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[10px] font-semibold text-[#BE0022] uppercase">
                                      Демо-макет · не покупка
                                    </p>
                                    <h4 className="font-display mt-0.5 text-sm font-bold text-[#2C2021]">
                                      {ev.title}
                                    </h4>
                                  </div>
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFEDE9] text-[#BE0022]">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                </div>

                                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#6E595B]">
                                  <Calendar className="h-3.5 w-3.5 text-[#BE0022]" />
                                  <span className="tabular-nums">
                                    {ev.dateLabel}, {ev.timeLabel}
                                  </span>
                                  <span>·</span>
                                  <span className="truncate">{ev.venue}</span>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#2C2021]/15 pt-2.5">
                                  <div>
                                    <p className="text-[10px] text-[#6E595B]">
                                      Образец · Сектор A · Место{' '}
                                      <span className="tabular-nums">
                                        {12 + idx}
                                      </span>
                                    </p>
                                    <p className="font-mono mt-0.5 text-[11px] font-medium text-[#2C2021] tabular-nums">
                                      DEMO-{ev.id.slice(0, 4).toUpperCase()}-2026
                                    </p>
                                  </div>
                                  <svg
                                    viewBox="0 0 28 28"
                                    className="h-10 w-10 text-[#2C2021]"
                                    aria-hidden="true"
                                  >
                                    <rect
                                      x="2"
                                      y="2"
                                      width="8"
                                      height="8"
                                      rx="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <rect
                                      x="5"
                                      y="5"
                                      width="2"
                                      height="2"
                                      fill="#BE0022"
                                    />
                                    <rect
                                      x="18"
                                      y="2"
                                      width="8"
                                      height="8"
                                      rx="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <rect
                                      x="21"
                                      y="5"
                                      width="2"
                                      height="2"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="2"
                                      y="18"
                                      width="8"
                                      height="8"
                                      rx="1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <rect
                                      x="5"
                                      y="21"
                                      width="2"
                                      height="2"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="13"
                                      y="4"
                                      width="2"
                                      height="6"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="13"
                                      y="13"
                                      width="4"
                                      height="4"
                                      fill="#BE0022"
                                    />
                                    <rect
                                      x="19"
                                      y="13"
                                      width="7"
                                      height="2"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="14"
                                      y="20"
                                      width="5"
                                      height="6"
                                      fill="currentColor"
                                    />
                                    <rect
                                      x="22"
                                      y="19"
                                      width="4"
                                      height="7"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Phone Navigation Bar */}
                  <div className="grid shrink-0 grid-cols-3 border-t border-[#2C2021]/8 bg-[#FEFEFF] px-2 py-2">
                    <button
                      type="button"
                      onClick={() => selectChapterManually('feed')}
                      className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-semibold transition-colors ${
                        phoneTab === 'feed' ||
                        phoneTab === 'detail' ||
                        phoneTab === 'launch' ||
                        phoneTab === 'interests'
                          ? 'text-[#BE0022]'
                          : 'text-[#6E595B]'
                      }`}
                    >
                      <Compass className="h-4 w-4" aria-hidden="true" />
                      <span>Афиша</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectChapterManually('favorites')}
                      className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-semibold transition-colors ${
                        phoneTab === 'favorites'
                          ? 'text-[#BE0022]'
                          : 'text-[#6E595B]'
                      }`}
                    >
                      <Heart className="h-4 w-4" aria-hidden="true" />
                      <span className="tabular-nums">
                        Избранное ({favoriteIds.length})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectChapterManually('tickets')}
                      className={`flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-semibold transition-colors ${
                        phoneTab === 'tickets'
                          ? 'text-[#BE0022]'
                          : 'text-[#6E595B]'
                      }`}
                    >
                      <Ticket className="h-4 w-4" aria-hidden="true" />
                      <span className="tabular-nums">
                        Билеты ({ticketIds.length})
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Synchronized Editorial Detail */}
            <div className="order-3 lg:col-span-4">
              <div className="rounded-3xl border border-[#2C2021]/8 bg-[#FEFEFF] p-6 taraz-card-shadow">
                <p className="text-xs font-semibold tracking-[0.1em] text-[#BE0022] uppercase">
                  Выбранное событие
                </p>
                <h3 className="font-display mt-2 text-2xl font-bold text-[#2C2021]">
                  {selectedEvent.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#6E595B]">
                  {selectedEvent.venue} · {selectedEvent.dateLabel},{' '}
                  {selectedEvent.timeLabel}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#2C2021]/10 py-4">
                  <div>
                    <p className="text-xs text-[#6E595B]">В избранном</p>
                    <p
                      data-testid="sync-favorites-count"
                      className="font-display mt-1 text-2xl font-bold text-[#2C2021] tabular-nums"
                    >
                      {favoriteIds.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6E595B]">Демо-билетов</p>
                    <p
                      data-testid="sync-tickets-count"
                      className="font-display mt-1 text-2xl font-bold text-[#BE0022] tabular-nums"
                    >
                      {ticketIds.length}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => openEventDetail(selectedEvent.id)}
                    className="rounded-xl bg-[#FFEDE9] px-4 py-2.5 text-xs font-semibold text-[#BE0022] transition-colors hover:bg-[#BE0022] hover:text-[#FEFEFF]"
                  >
                    Открыть карточку
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      manualLockUntilRef.current = Date.now() + 2500;
                      onReserveTicket(selectedEvent.id);
                    }}
                    className="rounded-xl border border-[#2C2021]/14 bg-[#FFF8F8] px-4 py-2.5 text-xs font-semibold text-[#2C2021] transition-colors hover:bg-[#FFEDE9]"
                  >
                    {ticketIds.includes(selectedEvent.id)
                      ? 'Показать макет'
                      : 'Тест демо-билета'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
