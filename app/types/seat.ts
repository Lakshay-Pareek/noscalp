// Seat status types
export type SeatStatus = "available" | "reserved" | "selected";

// Individual seat
export interface Seat {
  id: string;
  row: number;
  number: number;
  status: SeatStatus;
  section: string;
}

// Section configuration
export interface Section {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number[];
  position: "left" | "center-top" | "center-bottom" | "right";
  priceCategory: "vip" | "standard" | "economic";
}

// Venue layout types
export type VenueSize = "small" | "medium" | "large";

// Venue configuration
export interface VenueLayout {
  size: VenueSize;
  sections: Section[];
}

// Ticket tier pricing
export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Selected ticket for checkout
export interface SelectedTicket {
  seat: Seat;
  tier: TicketTier;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
}
