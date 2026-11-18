import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface TopNavbarProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'hero', label: 'История' },
  { id: 'gallery', label: 'Впечатления' },
  { id: 'app-showcase', label: 'Приложение' },
  { id: 'ai-guide', label: 'AI-гид' },
];

export function TopNavbar({ onNavigate }: TopNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    setMobileOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#2C2021]/8 bg-[#FFF8F8]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className="font-display shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-[#2C2021] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE0022]"
        >
          TARAZ <span className="text-[#BE0022]">EVENTS</span>
        </a>

        <nav
          aria-label="Основная навигация"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-[#2C2021]/80 underline-offset-4 transition-colors duration-200 hover:text-[#BE0022] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BE0022]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => handleLinkClick('early-access')}
            className="shrink-0 whitespace-nowrap rounded-xl bg-[#BE0022] px-4 py-2 text-xs font-semibold text-[#FEFEFF] transition-colors duration-200 hover:bg-[#9E001C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE0022] sm:text-sm"
          >
            Ранний доступ
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2C2021]/12 bg-[#FEFEFF] text-[#2C2021] transition-colors hover:bg-[#FFEDE9] focus-visible:outline-2 focus-visible:outline-[#BE0022] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Мобильное меню"
          className="border-t border-[#2C2021]/8 bg-[#FFF8F8] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#2C2021] transition-colors hover:bg-[#FFEDE9] hover:text-[#BE0022]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
