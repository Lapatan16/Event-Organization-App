import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { API_URL } from '../services/config';
import './EventsTickets.css';
import TicketsStats from './TicketsStats';
import api from '../services/api';
import type { Event } from '../types/Event';

export type Ticket = {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  sold?: number;
  date?: string;
  eventId?: string;
};

type Props = {
  existingTickets: Ticket[];
  eventId: string;
  event: Event;
};

const EventsTickets: React.FC<Props> = ({ existingTickets, eventId, event }) => {
  const [tickets, setTickets] = useState<Ticket[]>(existingTickets);
  const [editModeIds, setEditModeIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const validateTicket = (ticket: Ticket): boolean => {
    setValidationError(null);

    if (!ticket.name || ticket.name.length < 3 || ticket.name.length > 50) {
      setValidationError('Naziv ulaznice mora imati između 3 i 50 karaktera.');
      return false;
    }
    if (typeof ticket.quantity !== 'number' || ticket.quantity <= 0) {
      setValidationError('Količina ulaznice mora biti veća od 0.');
      return false;
    }
    if (ticket.price == null || ticket.price < 0) 
    {
      setValidationError("Cena ulaznice mora biti broj veći ili jednak 0.");
      return false;
    }
    
    
    return true;
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>(`${API_URL}/api/Event/${eventId}/tickets`);
      setTickets(res.data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Greška",
        detail: "Neuspešno učitavanje ulaznica",
        life: 3000,
      });
    }
  };

  const toggleEdit = (id?: string) => {
    if (!id) return;
    setValidationError(null);
    setEditModeIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleChange = (id: string, field: keyof Ticket, value: any) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket)));
  };

  const handleUpdate = async (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket || !id || id.length !== 24) return;
    if (!validateTicket(ticket)) return;

    try {
      await api.put(`${API_URL}/api/Event/${eventId}/tickets/${id}`, { ...ticket, id });
      setEditModeIds((prev) => prev.filter((e) => e !== id));
      fetchTickets();
      toast.current?.show({ severity: 'success', summary: 'Uspeh', detail: 'Ulaznica ažurirana', life: 3000 });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Greška', detail: 'Neuspešno ažuriranje ulaznice', life: 3000 });
    }
  };

  const handleAddTicket = (name: string, price: number) => {
    if(event.status !== 'draft')
    {
      toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće dodavati nove ulaznice kada je događaj objavljen." });
      return;
    }
    const newTicket: Ticket = { name, quantity: 1, price, date: new Date().toISOString(), eventId };
    const tempId = Math.random().toString(36).substr(2, 9);
    setTickets((prev) => [...prev, { ...newTicket, id: tempId }]);
    setEditModeIds((prev) => [...prev, tempId]);
  };

  const handleSave = async () => {
    if (!eventId) return;

    const newTickets = tickets.filter((ticket) => editModeIds.includes(ticket.id!) && ticket.id!.length < 24);
    for (const ticket of newTickets) {
      if (!validateTicket(ticket)) return;
    }

    try {
      await Promise.all(
        newTickets.map((ticket) =>
          api.post(`${API_URL}/api/Event/${eventId}/tickets`, {
            eventId: ticket.eventId,
            name: ticket.name,
            quantity: ticket.quantity,
            price: ticket.price,
            sold: 0,
            date: ticket.date || new Date().toISOString()
          })
        )
      );
      setEditModeIds([]);
      fetchTickets();
      toast.current?.show({ severity: 'success', summary: 'Uspeh', detail: 'Nove ulaznice sačuvane', life: 3000 });
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        // Backend sent "Conflict"
        toast.current?.show({
          severity: 'error',
          summary: 'Upozorenje',
          detail: 'Ulaznica sa ovim imenom već postoji',
          life: 4000
        });
      } else {
        // Generic error
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Greška', 
          detail: 'Neuspešno čuvanje ulaznica', 
          life: 3000 
        });
      }}
  };

  const confirmDelete = (id: string) => {
    if(event.status !== 'draft')
    {
      toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće brisati ulaznice kada je događaj objavljen." });
      return;
    }
    if (tickets.length <= 1) {
      setValidationError('Mora postojati bar jedna ulaznica.');
      return;
    }

    confirmDialog({
      message: 'Da li ste sigurni da želite da obrišete ovu kartu?',
      header: 'Potvrda brisanja',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          if (id.length < 24) {
            setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
            setEditModeIds((prev) => prev.filter((e) => e !== id));
          } else {
            await api.delete(`${API_URL}/api/Event/${eventId}/tickets/${id}`);
            fetchTickets();
            // setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
          }
          toast.current?.show({ severity: 'success', summary: 'Uspeh', detail: 'Ulaznica obrisana', life: 3000 });
        } catch (error) {
          toast.current?.show({ severity: 'error', summary: 'Greška', detail: 'Neuspešno brisanje ulaznice', life: 3000 });
        }
      }
    });
  };

  return (
    <div className="events-tickets-wrapper">
      <Toast ref={toast} />
      <ConfirmDialog />

      <TabView className="my-tabview">
        <TabPanel header="Postojeće ulaznice">
          {tickets.length > 0 && (
            <div className="ticket-header">
              <span>Naziv</span>
              <span>Količina</span>
              <span>Cena</span>
              <span>Akcije</span>
            </div>
          )}

          {validationError && (
            <div className="p-message p-message-error" style={{ marginBottom: '1rem' }}>
              <div className="p-message-text">{validationError}</div>
            </div>
          )}

          <div className="tickets-list">
            {tickets.map((ticket) => {
              const isEditing = ticket.id && editModeIds.includes(ticket.id);
              return (
                <div key={ticket.id} className="ticket-row">
                  {isEditing ? (
                    <>
                      <InputText value={ticket.name || ''} onChange={(e) => handleChange(ticket.id!, 'name', e.target.value)} />
                      <InputNumber value={ticket.quantity} onChange={(e) => handleChange(ticket.id!, 'quantity', e.value ?? 0)} min={1} showButtons />
                      <InputNumber
                        value={ticket.price || 0}
                        onChange={(e) => handleChange(ticket.id!, 'price', e.value)}
                        mode="currency"
                        currency="RSD"
                      />
                    </>
                  ) : (
                    <>
                      <InputText value={ticket.name || ''} disabled />
                      <InputNumber value={ticket.quantity || 0} disabled />
                      <InputNumber value={ticket.price || 0} disabled mode="currency" currency="RSD" />
                    </>
                  )}

                  <div className="ticket-actions">
                    <Button
                      icon={isEditing ? 'pi pi-check' : 'pi pi-pencil'}
                      className="p-button-text"
                      onClick={() => {
                        console.log(ticket.id);
                        
                        const isNew = !ticket.id || ticket.id.length < 24;
                        if(event.status !== 'draft')
                        {
                          toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće menjati ulaznice kada je događaj objavljen." });
                          return;
                        }
                        if (isEditing) {
                          isNew ? handleSave() : handleUpdate(ticket.id!);
                        } else {
                          toggleEdit(ticket.id!);
                        }
                      }}
                    />
                    <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => confirmDelete(ticket.id!)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="add-buttons-wrapper">
            <Button className="add-btn" label="+ Nova ulaznica" onClick={() => handleAddTicket('Plaćena ulaznica', 500)} />
            {/* <Button className="add-btn" label="+ Besplatna ulaznica" onClick={() => handleAddTicket('Besplatna ulaznica', 0)} />
            <Button className="add-btn" label="+ Humanitarna ulaznica" onClick={() => handleAddTicket('Humanitarna ulaznica', 1)} /> */}
          </div>
        </TabPanel>
        <TabPanel header="Statistika">
          <TicketsStats tickets={tickets} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default EventsTickets;