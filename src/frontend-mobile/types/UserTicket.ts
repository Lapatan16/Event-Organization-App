export type UserTicket = {
   id: string;
  eventId: string;
  userId: string;
  name: string;
  price: number;
  quantity: number;
  date: string;
  qrCode: string;
  status: 'active' | 'used';
  time: string;
};