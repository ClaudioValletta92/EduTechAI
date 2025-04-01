import { Chrono } from "react-chrono";

interface TimelineEvent {
  title: string;       // Data da visualizzare (es. "31 a.C.")
  event: string;       // Titolo evento (es. "Battaglia di Azio")
  description: string; // Descrizione dettagliata
}

interface TimelineProps {
  events?: TimelineEvent[];
}

const Timeline = ({ events }: TimelineProps) => {
  const sampleEvents: TimelineEvent[] = [
    {
      title: "32 a.C.",
      event: "Battaglia di Azio",
      description: "Ottaviano sconfigge Marco Antonio, fine delle guerre civili"
    },
    {
      title: "27 a.C.",
      event: "Augusto Imperatore",
      description: "Ottaviano riceve il titolo di Augusto dal Senato"
    },
    {
      title: "14 d.C.",
      event: "Morte di Augusto",
      description: "Fine dell'Età Augustea, inizio del Principato di Tiberio"
    },
    {
      title: "98 d.C.",
      event: "Regno di Traiano",
      description: "Massima espansione territoriale dell'Impero"
    }
  ];

  const chronoItems = sampleEvents.map((ev, index) => ({
    title: ev.title,
    cardTitle: ev.event,
    cardSubtitle: "", // Empty subtitle to make more space for title
    cardDetailedText: ev.description,
    id: `event-${index}`
  }));

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-[#adbbc4]">
        Timeline Storica
      </h2>
      <div className="h-[400px]">
        <Chrono
          items={chronoItems}
          mode="HORIZONTAL"
          showNavigation={false}
          disableToolbar={true}
          cardHeight={100} // Smaller initial height
          cardWidth={200}
          // Enable active item highlighting
          enableOutline={true}
          // Show all cards by default
          scrollable={{ scrollbar: false }}
          // Start with first item active
          activeItemIndex={0}
          // Hide the timeline circle
          hideControls={true}
          theme={{
            primary: "#1d2125",
            secondary: "transparent",
            cardBgColor: "#2d3748",
            cardForeColor: "#adbbc4",
            titleColor: "#ffffff",
            cardSubtitleColor: "transparent", // Hide subtitle
          }}
          classNames={{
            timeline: '!pt-0',
            controls: '!hidden',
            card: '!cursor-pointer !min-h-[100px]', // Make cards clickable
            title: '!text-[#adbbc4] !text-sm',
            cardMedia: '!hidden', // Hide media if any
            cardSubTitle: '!hidden', // Hide subtitle
          }}
          fontSizes={{
            cardTitle: "1.1rem",
            cardText: "0.9rem",
          }}
          // Expand card when clicked
          onItemSelected={(index) => {
            // This will expand the clicked card
            const cards = document.querySelectorAll('.react-chrono-card');
            cards.forEach((card, i) => {
              if (i === index) {
                card.classList.add('!h-auto');
                card.classList.add('!min-h-[200px]');
              } else {
                card.classList.remove('!h-auto');
                card.classList.remove('!min-h-[200px]');
              }
            });
          }}
        />
      </div>
    </div>
  );
};

export default Timeline;