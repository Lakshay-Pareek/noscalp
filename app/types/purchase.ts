import { SelectedTicket } from "./seat";

export interface PurchaseData {
  tickets: SelectedTicket[];
  customerDetails: CustomerDetails;
  totalAmount: number;
  purchaseDate: string;
}

export interface CustomerDetails {
  name: string;
  contactNumber: string;
  email: string;
}

export interface TicketDownloadData {
  eventTitle: string;
  eventImage: string;
  quantity: number;
  section: string;
  seatNumbers: string;
  date: string;
  time: string;
}
