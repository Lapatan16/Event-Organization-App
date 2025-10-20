import { Ticket } from "./Ticket";
import { Location } from "./Location";
import { EventTicket } from "./Event";

export interface EventDisplayData {
  // Sva polja iz Event-a
  id: string,
  title: string,
  description: string,
  type: string,
  contact: string,
  visibility: string,
  poster: string, // KORISTIMO 'poster' umesto 'image'
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string;
  location: Location,
  tickets: Array<EventTicket>,
  status: string,

  // DODATNA POLJA KOJA SU BILA U GREŠCI I OVAJ PUT IH MORAMO UKLJUČITI
  category: string; // Ovo polje ste želeli u EventDisplayData
  price: string;    // Ovo polje ste želeli u EventDisplayData
  // image: string; // NE KORISTIMO 'image' ako imamo 'poster' iz Event.ts

  // Dodatna polja specifična za prikaz
  color: string;
  hasTicket: boolean;
}