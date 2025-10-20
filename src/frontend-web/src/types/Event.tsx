import type { Location } from "./Location"
import type { Ticket } from "./Ticket"

export type Event = 
{
    id: string,
    organizerId: string,
    title: string,
    description: string,
    type: string,
    contact: string,
    visibility: string,
    poster: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    program: Array<Program>,
    location: Location,
    resources: Array<EventResource>,
    tickets: Array<Ticket>,
    createdAt: Date,
    updatedAt: Date,
    status: string,
}

export type EventResource = 
{
    id?: string;
    name: string;
    type: string;
    quantity: number;
    unit: string,
    isPublic: boolean,
    reserved: number,
    price: number,
}

export type Program = 
{
    id: string,
    name: string,
    date: Date | null,
    startTime: Date | null,
    endTime: Date | null,
    location: Location,
    description: string,
}