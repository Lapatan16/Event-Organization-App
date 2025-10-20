// types/Event.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  location: {
    city: string;
    lng: number;
    lat: number;
  };
  poster: string;
  contact: string;
  visibility: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  tickets: EventTicket[];
  category?: string; // Dodaj ovo
  price?: string; // Dodaj ovo
}

export type EventTicket = 
{
  id: string;
  name: string;
  quantity: number;
  price: number;
  time: number;
  sold: number;
};

export type Resource = 
{
    id: string;
    name: string;
    type: string;
    quantity: number;
    unit: string,
    public: boolean,
    reserved: number,
    price: number,
}