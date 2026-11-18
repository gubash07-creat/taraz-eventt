import { useCallback, useState } from 'react';
import { AiGuideScene } from './components/AiGuideScene';
import {
  AppShowcaseScene,
  type PhoneTab,
} from './components/AppShowcaseScene';
import { EarlyAccessScene } from './components/EarlyAccessScene';
import { GalleryScene } from './components/GalleryScene';
import { HeroScene } from './components/HeroScene';
import { TopNavbar } from './components/TopNavbar';
import { TARAZ_EVENTS, type FilterCategory } from './data/eventsData';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('Все');
  const [selectedEventId, setSelectedEventId] = useState<string>(
    TARAZ_EVENTS[0].id
  );
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('launch');
  const [manualTriggerVersion, setManualTriggerVersion] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    TARAZ_EVENTS[0].id,
    TARAZ_EVENTS[2].id,
  ]);
  const [ticketIds, setTicketIds] = useState<string[]>([]);

  const scrollToSection = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleToggleFavorite = useCallback((eventId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  const handleInspectInApp = useCallback(
    (eventId?: string) => {
      setManualTriggerVersion((v) => v + 1);
      if (eventId) {
        setSelectedEventId(eventId);
        setPhoneTab('detail');
      } else {
        setPhoneTab('feed');
      }
      scrollToSection('app-showcase');
    },
    [scrollToSection]
  );

  const handleReserveTicket = useCallback((eventId: string) => {
    setManualTriggerVersion((v) => v + 1);
    setTicketIds((prev) =>
      prev.includes(eventId) ? prev : [...prev, eventId]
    );
    setPhoneTab('tickets');
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F8] text-[#2C2021]">
      <TopNavbar onNavigate={scrollToSection} />

      <main>
        <HeroScene
          onExploreClick={() => scrollToSection('gallery')}
          onOpenAppStage={handleInspectInApp}
        />

        <GalleryScene
          events={TARAZ_EVENTS}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onInspectInApp={handleInspectInApp}
        />

        <AppShowcaseScene
          events={TARAZ_EVENTS}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          phoneTab={phoneTab}
          onPhoneTabChange={setPhoneTab}
          manualTriggerVersion={manualTriggerVersion}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          ticketIds={ticketIds}
          onReserveTicket={handleReserveTicket}
        />

        <AiGuideScene
          events={TARAZ_EVENTS}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onInspectInApp={handleInspectInApp}
        />

        <EarlyAccessScene onNavigate={scrollToSection} />
      </main>
    </div>
  );
}
