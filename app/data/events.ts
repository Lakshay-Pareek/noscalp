import { TimeSlot } from "../components/event/DateTimeSelector";

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  venue: string;
  timeSlots: TimeSlot[];
}

export const eventsData: Event[] = [
  {
    id: "taylor-swift-eras-tour",
    title: 'Taylor Swift Concert "The Eras Tour"',
    description:
      "Experience the magic of Taylor Swift's record-breaking Eras Tour live!",
    image: "/Events/7.png",
    category: "Concert",
    venue: "Royal Albert Hall, London",
    timeSlots: [
      {
        date: "03",
        day: "June",
        dayOfWeek: "SUN",
        time: "08:00 PM & 10:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 20,
      },
      {
        date: "05",
        day: "June",
        dayOfWeek: "TUES",
        time: "08:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 76,
      },
      {
        date: "03",
        day: "June",
        dayOfWeek: "SUN",
        time: "10:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 18,
      },
      {
        date: "05",
        day: "June",
        dayOfWeek: "TUES",
        time: "10:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 73,
      },
      {
        date: "04",
        day: "June",
        dayOfWeek: "MON",
        time: "08:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 40,
      },
      {
        date: "06",
        day: "June",
        dayOfWeek: "WED",
        time: "08:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 98,
      },
      {
        date: "04",
        day: "June",
        dayOfWeek: "MON",
        time: "10:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 60,
      },
      {
        date: "06",
        day: "June",
        dayOfWeek: "WED",
        time: "10:00 PM",
        venue: "Royal Albert Hall",
        price: "100$",
        ticketsAvailable: 102,
      },
    ],
  },
  {
    id: "kpop-show-ticket",
    title: "SBS MTV The Kpop Show Ticket Package",
    description: "Experience a live Kpop recording with SBS The Show tickets!",
    image: "/events/kpop-group.png",
    category: "Concert",
    venue: "SBS Prism Tower, Seoul",
    timeSlots: [
      {
        date: "14",
        day: "Jan",
        dayOfWeek: "SUN",
        time: "06:00 PM & 09:00 PM",
        venue: "SBS Prism Tower",
        price: "75$",
        ticketsAvailable: 30,
      },
      {
        date: "15",
        day: "Jan",
        dayOfWeek: "MON",
        time: "06:00 PM",
        venue: "SBS Prism Tower",
        price: "75$",
        ticketsAvailable: 45,
      },
    ],
  },
];

export function getEventById(id: string): Event | undefined {
  return eventsData.find((event) => event.id === id);
}

export function getAllEventIds(): string[] {
  return eventsData.map((event) => event.id);
}
