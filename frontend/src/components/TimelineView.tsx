import { Chrono } from "react-chrono";

interface TimelineEvent {
  title: string;       // Es. "31 a.C."
  event: string;       // Es. "Battaglia di Azio"
  description: string; // Es. "Descrizione dell'evento"
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline = ({ events }: TimelineProps) => {
  if (!events.length) {
    return <p className="text-gray-500 text-center">No events available</p>;
  }

  const chronoItems = events.map((ev, index) => ({
    title: ev.title,
    cardTitle: ev.event,
    cardDetailedText: ev.description,
    id: `event-${index}`,
  }));

  return (
    <div className="mt-8">
      <div className="h-[400px]">
        <Chrono
          items={chronoItems}
          mode="VERTICAL"
          showNavigation={true}
          disableToolbar={true}
          enableOutline={true}
          hideControls={true}
          theme={{
            primary: "#1d2125",
            secondary: "transparent",
            cardBgColor: "#2d3748",
            cardForeColor: "#adbbc4",
            titleColor: "#ffffff",
          }}
          fontSizes={{
            cardTitle: "1.1rem",
            cardText: "0.9rem",
          }}
        />
      </div>
    </div>
  );
};

export default Timeline;
