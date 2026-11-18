import { ArrowUpRight, Calendar, Heart, MapPin, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CATEGORIES,
  type FilterCategory,
  type TarazEvent,
} from '../data/eventsData';
import { filterEvents } from '../utils/eventsLogic';

gsap.registerPlugin(ScrollTrigger);

interface GallerySceneProps {
  events: TarazEvent[];
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  favoriteIds: string[];
  onToggleFavorite: (eventId: string) => void;
  onInspectInApp: (eventId: string) => void;
}

export function GalleryScene({
  events,
  activeCategory,
  onCategoryChange,
  favoriteIds,
  onToggleFavorite,
  onInspectInApp,
}: GallerySceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const filteredEvents = filterEvents(events, activeCategory);
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);

  const previewEvent = previewEventId
    ? events.find((e) => e.id === previewEventId) ?? null
    : null;

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !sectionRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        gsap.utils.toArray<HTMLElement>('.editorial-lookbook-item').forEach((panel, idx) => {
          gsap.fromTo(
            panel,
            { clipPath: 'inset(10% 0% 0% 0% round 2rem)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 2rem)',
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'clipPath',
              scrollTrigger: {
                trigger: panel,
                start: 'top 86%',
                once: true,
              },
            }
          );

          // Asymmetric vertical drift between overlapping left/right plates
          gsap.to(panel, {
            y: idx % 2 === 0 ? -18 : 24,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });

          const img = panel.querySelector('.editorial-parallax-photo');
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: -6, scale: 1.1 },
              {
                yPercent: 6,
                scale: 1.1,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
          }
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="scroll-mt-16 overflow-hidden bg-[#FFF8F8] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Giant Asymmetric Editorial Header */}
        <div className="border-b border-[#2C2021]/10 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#BE0022] uppercase">
            02. Выбирай впечатления
          </p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="font-display text-balance text-[clamp(2.2rem,5vw,4.25rem)] font-bold leading-[1.02] tracking-tight text-[#2C2021]">
              Сцены живого <span className="text-[#BE0022] italic">Тараза</span>
            </h2>

            {/* Category Filter Ribbon */}
            <div
              role="tablist"
              aria-label="Фильтр категорий мероприятий"
              className="flex shrink-0 flex-wrap items-center gap-1 rounded-2xl bg-[#FBF1F3] p-1.5 lg:flex-nowrap"
            >
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      onCategoryChange(category);
                      setPreviewEventId(null);
                    }}
                    className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#BE0022] ${
                      isActive
                        ? 'bg-[#BE0022] text-[#FEFEFF] shadow-xs'
                        : 'bg-transparent text-[#2C2021]/80 hover:bg-[#FFEDE9] hover:text-[#2C2021]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inline Event Preview Spotlight */}
        <AnimatePresence initial={false}>
          {previewEvent && (
            <motion.div
              key={previewEvent.id}
              initial={prefersReduced ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              data-testid="gallery-inline-preview"
              className="mt-8 overflow-hidden rounded-3xl border border-[#2C2021]/10 bg-[#FEFEFF] p-5 taraz-card-shadow sm:p-7"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-[#FFEDE9] md:h-44 md:w-72">
                  <img
                    src={previewEvent.image}
                    alt={previewEvent.imageAlt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#BE0022]">
                        Предпросмотр · {previewEvent.category}
                      </p>
                      <h3 className="font-display mt-1 text-2xl font-bold text-[#2C2021]">
                        {previewEvent.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewEventId(null)}
                      aria-label="Закрыть предпросмотр события"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2C2021]/12 bg-[#FFF8F8] text-[#2C2021] hover:bg-[#FFEDE9]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6E595B]">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-[#BE0022]" />
                      {previewEvent.dateLabel}, {previewEvent.timeLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#BE0022]" />
                      {previewEvent.venue} ({previewEvent.district})
                    </span>
                    <span className="font-semibold text-[#2C2021]">
                      {previewEvent.priceLabel}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#2C2021]/85">
                    {previewEvent.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onInspectInApp(previewEvent.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#BE0022] px-4 py-2.5 text-xs font-semibold text-[#FEFEFF] transition-colors hover:bg-[#9E001C]"
                    >
                      <span>Открыть в смартфоне</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(previewEvent.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#2C2021]/12 bg-[#FFF8F8] px-4 py-2.5 text-xs font-semibold text-[#2C2021] hover:bg-[#FFEDE9]"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          favoriteIds.includes(previewEvent.id)
                            ? 'fill-[#BE0022] text-[#BE0022]'
                            : 'text-[#2C2021]'
                        }`}
                      />
                      <span>
                        {favoriteIds.includes(previewEvent.id)
                          ? 'В избранном'
                          : 'Сохранить'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlapping Asymmetric Lookbook Composition (explicit grid-row overlaps, zero empty columns) */}
        <div
          data-testid="gallery-grid"
          className="mt-12 grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-y-16"
        >
          {filteredEvents.map((event, index) => {
            const pairIndex = Math.floor(index / 2);
            const isFirstInPair = index % 2 === 0;
            const isOddPair = pairIndex % 2 === 1;
            const isSingle = filteredEvents.length === 1;

            const rowStartClass =
              pairIndex === 0
                ? 'md:row-start-1'
                : pairIndex === 1
                  ? 'md:row-start-2'
                  : 'md:row-start-3';

            // True asymmetric overlap in 12-column grid (e.g. cols 1..9 overlapped by cols 8..13)
            const placementClass = isSingle
              ? 'md:col-span-12'
              : !isOddPair
                ? isFirstInPair
                  ? `md:col-start-1 md:col-end-9 ${rowStartClass} md:z-0`
                  : `md:col-start-8 md:col-end-13 ${rowStartClass} md:mt-24 md:z-10`
                : isFirstInPair
                  ? `md:col-start-1 md:col-end-6 ${rowStartClass} md:z-10`
                  : `md:col-start-5 md:col-end-13 ${rowStartClass} md:mt-20 md:z-0`;

            const frameDimensions = isSingle
              ? 'min-h-[320px] aspect-[4/3] md:min-h-0 md:h-[540px] md:aspect-auto'
              : !isOddPair
                ? isFirstInPair
                  ? 'min-h-[320px] aspect-[4/3] md:min-h-0 md:h-[520px] md:aspect-auto'
                  : 'aspect-[3/4] md:h-[470px] md:aspect-auto'
                : isFirstInPair
                  ? 'aspect-[3/4] md:h-[480px] md:aspect-auto'
                  : 'min-h-[320px] aspect-[4/3] md:min-h-0 md:h-[470px] md:aspect-auto';

            const isFav = favoriteIds.includes(event.id);
            const isSelectedPreview = previewEventId === event.id;
            const isOverlappedRight = !isSingle && !isOddPair && isFirstInPair;
            const isOverlappedLeft = !isSingle && isOddPair && !isFirstInPair;
            const isNarrowPortrait =
              !isSingle &&
              ((!isOddPair && !isFirstInPair) || (isOddPair && isFirstInPair));

            return (
              <article
                key={event.id}
                className={`editorial-lookbook-item group relative ${placementClass}`}
              >
                <div
                  className={`relative w-full overflow-hidden rounded-[2rem] border bg-[#FFEDE9] taraz-card-shadow ${
                    isSelectedPreview
                      ? 'border-[#BE0022] ring-2 ring-[#BE0022]/30'
                      : 'border-[#FEFEFF]'
                  } ${frameDimensions}`}
                >
                  <img
                    src={event.image}
                    alt={event.imageAlt}
                    referrerPolicy="no-referrer"
                    className="editorial-parallax-photo h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2C2021]/92 via-[#2C2021]/28 to-transparent" />

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(event.id)}
                    aria-pressed={isFav}
                    aria-label={
                      isFav
                        ? `Убрать «${event.title}» из избранного`
                        : `Добавить «${event.title}» в избранное`
                    }
                    className={`absolute top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FEFEFF]/92 text-[#2C2021] shadow-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#BE0022] ${
                      isOverlappedRight
                        ? 'right-5 md:right-32 lg:right-40'
                        : 'right-5'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isFav
                          ? 'fill-[#BE0022] text-[#BE0022]'
                          : 'text-[#2C2021]'
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute inset-x-6 bottom-6 z-10 text-[#FEFEFF] sm:inset-x-8 sm:bottom-8 ${
                      isOverlappedRight ? 'md:pr-32 lg:pr-44' : ''
                    } ${isOverlappedLeft ? 'md:pl-32 lg:pl-44' : ''}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#FFEDE9]">
                      <span className="font-mono tabular-nums">
                        0{index + 1}
                      </span>
                      <span aria-hidden="true">/</span>
                      <span>{event.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {event.dateLabel}, {event.timeLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{event.venue}</span>
                    </div>

                    <div
                      className={`mt-2 flex flex-col justify-between gap-4 ${
                        isNarrowPortrait
                          ? 'items-start'
                          : 'sm:flex-row sm:items-end'
                      }`}
                    >
                      <div className="min-w-0 max-w-xl">
                        <h3 className="font-display text-2xl font-bold leading-[1.12] sm:text-3xl">
                          {event.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-[#FFF8F8]/85">
                          {event.subtitle} · {event.priceLabel}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewEventId((prev) =>
                              prev === event.id ? null : event.id
                            )
                          }
                          className="whitespace-nowrap rounded-xl border border-[#FEFEFF]/35 bg-[#2C2021]/40 px-4 py-2.5 text-xs font-semibold text-[#FEFEFF] backdrop-blur-xs transition-colors hover:bg-[#2C2021]/65"
                        >
                          {isSelectedPreview ? 'Скрыть' : 'Предпросмотр'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onInspectInApp(event.id)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#FEFEFF] px-4 py-2.5 text-xs font-semibold text-[#2C2021] transition-colors duration-200 hover:bg-[#FFEDE9] hover:text-[#BE0022]"
                        >
                          <span>В приложении</span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
