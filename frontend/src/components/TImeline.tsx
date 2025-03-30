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
      title: "31 a.C.",
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
    cardDetailedText: ev.description,
    id: `event-${index}`
  }));

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-[#adbbc4]">
        Timeline StoricaS
      </h2>
      <div className="h-[400px]">
        <Chrono
          disableToolbar={true}
          mode="VERTICAL"
          showNavigation={false} // Disable navigation buttons (arrows)
        />
      </div>
    </div>
  );
};

export default Timeline;
