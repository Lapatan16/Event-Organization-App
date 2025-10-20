import React from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";

import type { Ticket } from "../types/Ticket";

type TicketItemProps = {
  ticket: Ticket;
  onChange: (id: string, field: keyof Ticket, value: string | number) => void;
  onDelete: (id: string) => void;
};

const TicketItem: React.FC<TicketItemProps> = ({ ticket, onChange, onDelete }) => (
  <div className="ticket-row">
    <InputText
      placeholder="Npr. Regularna ulaznica"
      value={ticket.name}
      onChange={(e) => onChange(ticket.id, "name", e.target.value)}
    />
    <InputNumber
      placeholder="Beskonačno"
      value={ticket.quantity}
      onChange={(e) => onChange(ticket.id, "quantity", e.value ?? 0)}
    />
    <InputNumber
      disabled={ticket.price === 0}
      placeholder={ticket.price === 0 ? "Besplatno" : "Cena"}
      value={ticket.price}
      onChange={(e) => onChange(ticket.id, "price", e.value ?? 0)}
    />
    <div className="ticket-actions">
      <Button
        icon="pi pi-trash"
        className="p-button-text"
        severity="danger"
        type="button"
        onClick={() => onDelete(ticket.id)}
      />
    </div>
  </div>
);

type TicketListProps = {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
};

const TicketList: React.FC<TicketListProps> = ({ tickets, setTickets }) => {
  const addTicket = (type: "paid" | "free" | "donation") => {
    const price = type === "free" ? 0 : 1;
    setTickets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        quantity: 0,
        price,
        time: Date.now(),
        sold: 0,
      },
    ]);
  };

  const onChange = (id: string, field: keyof Ticket, value: string | number) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const onDelete = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="ticket-wrapper">
      {tickets.length > 0 && (
        <div className="ticket-header">
          <span>
            Naziv <span style={{ color: "red" }}>*</span>
          </span>
          <span>
            Količina <span style={{ color: "red" }}>*</span>
          </span>
          <span>
            Cena <span style={{ color: "red" }}>*</span>
          </span>
          <span>Akcije</span>
        </div>
      )}

      {tickets.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} onChange={onChange} onDelete={onDelete} />
      ))}

      <div className="ticket-buttons">
        <Button
          type="button"
          label="+ Plaćena ulaznica"
          onClick={() => addTicket("paid")}
        />
        <Button
          type="button"
          label="+ Besplatna ulaznica"
          onClick={() => addTicket("free")}
        />
        <Button
          type="button"
          label="+ Humanitarna ulaznica"
          onClick={() => addTicket("donation")}
        />
      </div>
    </div>
  );
};

export default TicketList;
