import { ArrowRight, ArrowUpRight, Heart } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import {
  INTEREST_OPTIONS,
  TIME_SLOTS,
  type InterestId,
  type TarazEvent,
  type TimeSlot,
} from '../data/eventsData';
import { recommendEvents } from '../utils/eventsLogic';

interface AiGuideSceneProps {
  events: TarazEvent[];
  favoriteIds: string[];
  onToggleFavorite: (eventId: string) => void;
  onInspectInApp: (eventId: string) => void;
}

export function AiGuideScene({
  events,
  favoriteIds,
  onToggleFavorite,
  onInspectInApp,
}: AiGuideSceneProps) {
  const prefersReduced = useReducedMotion();
  const [selectedInterest, setSelectedInterest] = useState<InterestId>('music');
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<TimeSlot>('На выходных');

  const recommendations = recommendEvents(
    events,
    selectedInterest,
    selectedTimeSlot,
    3
  );

  const activeInterestOption = INTEREST_OPTIONS.find(
    (item) => item.id === selectedInterest
  );

  return (
    <section
      id="ai-guide"
      className="scroll-mt-16 bg-[#FFF8F8] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Top Full-Width Editorial Header & Interactive Signal Ribbon (breaks 2-column split cliché) */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#BE0022] uppercase">
            04. Персональный AI-гид
          </p>
          <h2 className="font-display text-balance mt-2 text-[clamp(2.1rem,4.5vw,3.75rem)] font-bold leading-[1.06] text-[#2C2021]">
            Собери маршрут{' '}
            <span className="text-[#BE0022] italic">под своё настроение</span>
          </h2>

          {/* Interest Ribbon */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {INTEREST_OPTIONS.map((option) => {
              const active = selectedInterest === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedInterest(option.id)}
                  className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#BE0022] sm:text-sm ${
                    active
                      ? 'border-[#BE0022] bg-[#BE0022] text-[#FEFEFF] shadow-sm'
                      : 'border-[#2C2021]/10 bg-[#FFEDE9]/75 text-[#2C2021] hover:bg-[#FFEDE9]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Timing & Visual Personalization Logic Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-xl bg-[#FBF1F3] p-1">
              {TIME_SLOTS.map((slot) => {
                const active = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#2C2021] text-[#FEFEFF]'
                        : 'text-[#2C2021]/75 hover:text-[#2C2021]'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <div
              aria-label="Логика подбора"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6E595B]"
            >
              <span className="text-[#BE0022]">
                {activeInterestOption?.label}
              </span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{selectedTimeSlot}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-[#2C2021] tabular-nums">
                {recommendations.length} события
              </span>
            </div>
          </div>
        </div>

        {/* Staggered 3-Poster Editorial Triptych */}
        <div
          data-testid="ai-recommendations-list"
          className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3 md:items-start"
        >
          <AnimatePresence mode="popLayout">
            {recommendations.map(({ event, reason, matchType }, idx) => {
              const isFav = favoriteIds.includes(event.id);
              const staggerOffset =
                idx === 1 ? 'md:mt-10' : idx === 2 ? 'md:mt-4' : '';

              return (
                <motion.article
                  key={`${selectedInterest}-${selectedTimeSlot}-${event.id}`}
                  layout={!prefersReduced}
                  initial={
                    prefersReduced
                      ? false
                      : { opacity: 0, y: 18, scale: 0.97 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: -12, scale: 0.97 }
                  }
                  transition={{
                    duration: 0.32,
                    delay: prefersReduced ? 0 : idx * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`group overflow-hidden rounded-[2rem] border border-[#2C2021]/8 bg-[#FEFEFF] taraz-card-shadow ${staggerOffset}`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFEDE9]">
                    <img
                      src={event.image}
                      alt={event.imageAlt}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2C2021]/92 via-[#2C2021]/30 to-transparent" />

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(event.id)}
                      aria-pressed={isFav}
                      aria-label={
                        isFav
                          ? `Удалить «${event.title}» из избранного`
                          : `Сохранить «${event.title}» в избранное`
                      }
                      className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FEFEFF]/92 text-[#2C2021] shadow-sm transition-transform duration-200 hover:scale-105"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFav
                            ? 'fill-[#BE0022] text-[#BE0022]'
                            : 'text-[#2C2021]'
                        }`}
                      />
                    </button>

                    <div className="absolute inset-x-5 bottom-5 z-10 text-[#FEFEFF]">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#FFEDE9]">
                        <span className="font-mono font-semibold tabular-nums">
                          0{idx + 1}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span>
                          {matchType === 'exact'
                            ? 'Точный выбор'
                            : matchType === 'mood'
                              ? 'По интересу'
                              : 'Стоит открыть'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{event.dateLabel}</span>
                      </div>

                      <h4 className="font-display mt-1.5 text-2xl font-bold leading-tight">
                        {event.title}
                      </h4>

                      <p className="mt-2 text-xs leading-relaxed text-[#FFF8F8]/85">
                        {reason}
                      </p>

                      <button
                        type="button"
                        onClick={() => onInspectInApp(event.id)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FEFEFF] px-4 py-2 text-xs font-semibold text-[#2C2021] transition-colors hover:bg-[#FFEDE9] hover:text-[#BE0022]"
                      >
                        <span>Открыть в смартфоне</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
