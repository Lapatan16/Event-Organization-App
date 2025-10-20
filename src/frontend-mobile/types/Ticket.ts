export type Ticket = {
  userId: string;
  eventId: any;
  date: any;
  id: string;
  name: string;
  quantity: number;
  price: number;
  time: number;
  qrCode: string,
  isScanned: boolean,
  services: Array<Usluge>,
};

export type Usluge = 
{
  id: string,
  name: string,
  quantity: number,
  price: string,
}