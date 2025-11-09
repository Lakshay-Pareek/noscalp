import {
  VenueLayout,
  Section,
  Seat,
  TicketTier,
  VenueSize,
} from "../types/seat";

// Ticket tier pricing
export const ticketTiers: TicketTier[] = [
  {
    id: "vip",
    name: "VIP Tickets",
    price: 399,
    description: "Premium seating with exclusive benefits",
  },
  {
    id: "standard",
    name: "Standard Tickets",
    price: 299,
    description: "Great view and comfortable seating",
  },
  {
    id: "economic",
    name: "Economic Tickets",
    price: 199,
    description: "Affordable pricing, good experience",
  },
];

// Large venue layout (like the image - 4 sections)
const largeVenueLayout: Section[] = [
  {
    id: "section-1",
    name: "Section 1",
    rows: 12,
    seatsPerRow: [8, 9, 10, 10, 11, 11, 12, 12, 12, 11, 10, 9],
    position: "center-top",
    priceCategory: "standard",
  },
  {
    id: "section-2",
    name: "Section 2",
    rows: 8,
    seatsPerRow: [8, 9, 10, 10, 11, 11, 10, 9],
    position: "center-bottom",
    priceCategory: "vip",
  },
  {
    id: "section-3",
    name: "Section 3",
    rows: 14,
    seatsPerRow: [6, 7, 7, 8, 8, 9, 9, 10, 10, 9, 8, 7, 6, 5],
    position: "left",
    priceCategory: "economic",
  },
  {
    id: "section-4",
    name: "Section 4",
    rows: 14,
    seatsPerRow: [6, 7, 7, 8, 8, 9, 9, 10, 10, 9, 8, 7, 6, 5],
    position: "right",
    priceCategory: "economic",
  },
];

// Medium venue layout (2-3 sections)
const mediumVenueLayout: Section[] = [
  {
    id: "section-1",
    name: "Section 1",
    rows: 10,
    seatsPerRow: [8, 9, 10, 11, 12, 12, 11, 10, 9, 8],
    position: "center-top",
    priceCategory: "vip",
  },
  {
    id: "section-2",
    name: "Section 2",
    rows: 8,
    seatsPerRow: [10, 11, 12, 12, 11, 10, 9, 8],
    position: "left",
    priceCategory: "standard",
  },
  {
    id: "section-3",
    name: "Section 3",
    rows: 8,
    seatsPerRow: [10, 11, 12, 12, 11, 10, 9, 8],
    position: "right",
    priceCategory: "standard",
  },
];

// Small venue layout (1-2 sections)
const smallVenueLayout: Section[] = [
  {
    id: "section-1",
    name: "Section 1",
    rows: 8,
    seatsPerRow: [6, 7, 8, 9, 9, 8, 7, 6],
    position: "center-top",
    priceCategory: "vip",
  },
  {
    id: "section-2",
    name: "Section 2",
    rows: 6,
    seatsPerRow: [8, 9, 10, 10, 9, 8],
    position: "center-bottom",
    priceCategory: "standard",
  },
];

// Venue layouts by size
export const venueLayouts: Record<VenueSize, VenueLayout> = {
  large: {
    size: "large",
    sections: largeVenueLayout,
  },
  medium: {
    size: "medium",
    sections: mediumVenueLayout,
  },
  small: {
    size: "small",
    sections: smallVenueLayout,
  },
};

// Generate initial seat data for a section
export function generateSeatsForSection(section: Section): Seat[] {
  const seats: Seat[] = [];

  for (let rowIndex = 0; rowIndex < section.rows; rowIndex++) {
    const seatsInRow = section.seatsPerRow[rowIndex];

    for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
      // Randomly mark some seats as reserved (about 30%)
      const isReserved = Math.random() < 0.3;

      seats.push({
        id: `${section.id}-row${rowIndex + 1}-seat${seatNum}`,
        row: rowIndex + 1,
        number: seatNum,
        status: isReserved ? "reserved" : "available",
        section: section.id,
      });
    }
  }

  return seats;
}

// Generate all seats for a venue
export function generateVenueSeats(layout: VenueLayout): Seat[] {
  const allSeats: Seat[] = [];

  layout.sections.forEach((section) => {
    const sectionSeats = generateSeatsForSection(section);
    allSeats.push(...sectionSeats);
  });

  return allSeats;
}

import { getEventById } from "./events";

// Get venue layout by event ID
export function getVenueLayoutByEventId(eventId: string): VenueLayout {
  const event = getEventById(eventId);

  if (event && event.venueSize) {
    return venueLayouts[event.venueSize];
  }

  // Default to medium if event not found
  return venueLayouts.medium;
}

// Get ticket tier for a section
export function getTierForSection(
  sectionId: string,
  layout: VenueLayout
): TicketTier {
  const section = layout.sections.find((s) => s.id === sectionId);
  const priceCategory = section?.priceCategory || "standard";
  return ticketTiers.find((t) => t.id === priceCategory) || ticketTiers[1];
}
