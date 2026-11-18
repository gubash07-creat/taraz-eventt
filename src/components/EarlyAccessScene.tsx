import { AlertCircle, ArrowRight, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CATEGORIES,
  REFERENCE_APP_IMAGE,
  type FilterCategory,
} from '../data/eventsData';
import { validateEarlyAccessForm } from '../utils/eventsLogic';

gsap.registerPlugin(ScrollTrigger);

interface EarlyAccessSceneProps {
  onNavigate: (sectionId: string) => void;
}

export function EarlyAccessScene({ onNavigate }: EarlyAccessSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [favoriteCategory, setFavoriteCategory] =
    useState<FilterCategory>('Концерты');
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const [backendNoticeVisible, setBackendNoticeVisible] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !sectionRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: 0.45 },
          {
            scale: 1.08,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'center center',
              scrub: 0.8,
            },
          }
        );
      }

      if (emblemRef.current) {
        gsap.from(emblemRef.current, {
          scale: 0.84,
          y: 28,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 76%',
            once: true,
          },
        });
      }

      gsap.from('.final-brand-reveal', {
        y: 30,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 74%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateEarlyAccessForm({
      name,
      contact,
      favoriteCategory,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      setBackendNoticeVisible(false);
      return;
    }

    setErrors({});
    setBackendNoticeVisible(true);
  };

  return (
    <>
      <section
        id="early-access"
        ref={sectionRef}
        className="scroll-mt-16 relative overflow-hidden bg-gradient-to-b from-[#FFF8F8] via-[#FBF1F3] to-[#FFEDE9] py-24 sm:py-32"
      >
        {/* Spatial Light-Palette Glow */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="taraz-spatial-glow pointer-events-none absolute inset-0"
        />

        <div className="relative mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Monumental Finale Typography & Animated Brand Mark */}
            <div className="lg:col-span-7">
              <div
                ref={emblemRef}
                className="inline-flex items-center gap-4 rounded-3xl border border-[#2C2021]/8 bg-[#FEFEFF] p-3 pr-6 taraz-card-shadow"
              >
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#2C2021]/8 bg-[#FFF8F8]">
                  <img
                    src={REFERENCE_APP_IMAGE}
                    alt="Фирменная иконка приложения TARAZ EVENTS"
                    referrerPolicy="no-referrer"
                    className="h-full w-full scale-[2.1] object-cover object-[50%_27%]"
                  />
                </div>
                <div className="text-left">
                  <p className="font-display text-xl font-bold tracking-tight text-[#2C2021]">
                    TARAZ <span className="text-[#BE0022]">EVENTS</span>
                  </p>
                  <p className="text-xs text-[#6E595B]">
                    Тараз, Қазақстан · Предзапуск
                  </p>
                </div>
              </div>

              <h2 className="final-brand-reveal font-display text-balance mt-8 text-[clamp(2.4rem,5.2vw,4.6rem)] font-bold leading-[1.03] tracking-tight text-[#2C2021]">
                Тараз живёт.{' '}
                <span className="block text-[#BE0022] italic">
                  Будь в центре событий
                </span>
              </h2>
              <p className="final-brand-reveal mt-5 max-w-lg text-base leading-relaxed text-[#6E595B] sm:text-lg">
                Оставьте контакт для приглашения к первому открытому релизу
                приложения в городе.
              </p>
            </div>

            {/* Right Clean Early Access Card with Honest Unconnected-Backend State */}
            <div className="final-brand-reveal lg:col-span-5">
              <div className="rounded-[2rem] border border-[#2C2021]/8 bg-[#FEFEFF] p-6 taraz-card-shadow sm:p-8">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4 text-left"
                >
                  <div>
                    <label
                      htmlFor="waitlist-name"
                      className="block text-xs font-semibold text-[#2C2021]"
                    >
                      Ваше имя
                    </label>
                    <input
                      id="waitlist-name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setBackendNoticeVisible(false);
                      }}
                      placeholder="Например, Айгерим"
                      aria-invalid={Boolean(errors.name)}
                      className="mt-1.5 w-full rounded-xl border border-[#2C2021]/15 bg-[#FFF8F8] px-4 py-3 text-sm text-[#2C2021] placeholder:text-[#6E595B]/65 focus:border-[#BE0022] focus:bg-[#FEFEFF] focus:outline-none"
                    />
                    {errors.name && (
                      <p
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-[#BE0022]"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="waitlist-contact"
                      className="block text-xs font-semibold text-[#2C2021]"
                    >
                      Email или телефон
                    </label>
                    <input
                      id="waitlist-contact"
                      name="contact"
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        setBackendNoticeVisible(false);
                      }}
                      placeholder="name@example.kz или +7 701 555 00 00"
                      aria-invalid={Boolean(errors.contact)}
                      className="mt-1.5 w-full rounded-xl border border-[#2C2021]/15 bg-[#FFF8F8] px-4 py-3 text-sm text-[#2C2021] placeholder:text-[#6E595B]/65 focus:border-[#BE0022] focus:bg-[#FEFEFF] focus:outline-none"
                    />
                    {errors.contact && (
                      <p
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-[#BE0022]"
                      >
                        {errors.contact}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="waitlist-category"
                      className="block text-xs font-semibold text-[#2C2021]"
                    >
                      Что вам ближе всего?
                    </label>
                    <select
                      id="waitlist-category"
                      name="favoriteCategory"
                      value={favoriteCategory}
                      onChange={(e) => {
                        setFavoriteCategory(e.target.value as FilterCategory);
                        setBackendNoticeVisible(false);
                      }}
                      className="mt-1.5 w-full rounded-xl border border-[#2C2021]/15 bg-[#FFF8F8] px-4 py-3 text-sm text-[#2C2021] focus:border-[#BE0022] focus:bg-[#FEFEFF] focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BE0022] px-6 py-3.5 text-sm font-semibold text-[#FEFEFF] shadow-[0_12px_28px_-8px_rgba(190,0,34,0.42)] transition-colors duration-200 hover:bg-[#9E001C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE0022]"
                  >
                    <span>Получить ранний доступ</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {backendNoticeVisible ? (
                    <div
                      data-testid="early-access-unconnected"
                      role="status"
                      className="flex items-start gap-3 rounded-2xl border border-[#BE0022]/25 bg-[#FBF1F3] p-4"
                    >
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#BE0022]"
                        aria-hidden="true"
                      />
                      <div className="text-xs leading-relaxed text-[#2C2021]">
                        <p className="font-bold text-[#BE0022]">
                          Сервер приёма заявок ещё не подключён
                        </p>
                        <p className="mt-1 text-[#2C2021]/85">
                          Данные проверены на корректность, но не отправлены и
                          не сохранены: эта статическая версия сайта работает
                          без бэкенда.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 pt-1 text-[11px] leading-relaxed text-[#6E595B]">
                      <Info
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#BE0022]"
                        aria-hidden="true"
                      />
                      <span>
                        Статическая версия предзапуска: форма проверяет поля, но
                        пока не подключена к серверу и не сохраняет заявки.
                      </span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#2C2021]/8 bg-[#FFF8F8] py-10">
        <div className="mx-auto flex max-w-[1340px] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-base font-bold text-[#2C2021]">
              TARAZ <span className="text-[#BE0022]">EVENTS</span>
            </p>
            <p className="mt-1 text-xs text-[#6E595B]">
              Тараз, Қазақстан · Тараз живёт. Будь в центре событий.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#6E595B]">
            <button
              type="button"
              onClick={() => onNavigate('hero')}
              className="hover:text-[#BE0022]"
            >
              История
            </button>
            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="hover:text-[#BE0022]"
            >
              Впечатления
            </button>
            <button
              type="button"
              onClick={() => onNavigate('app-showcase')}
              className="hover:text-[#BE0022]"
            >
              Приложение
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai-guide')}
              className="hover:text-[#BE0022]"
            >
              AI-гид
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
