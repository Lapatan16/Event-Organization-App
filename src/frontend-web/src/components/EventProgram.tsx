import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputTextarea } from "primereact/inputtextarea";
import { addLocale } from "primereact/api";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import type { Event, Program } from "../types/Event";
import { API_URL } from "../services/config";
import Spinner from "../utils/Spinner";
import api from "../services/api";

import "./EventProgram.css";

type Props = {
    event: Event;
};

const EventProgram = ({ event }: Props) => {
    const [programList, setProgramList] = useState<Program[]>([]);
    const [visible, setVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [newProgram, setNewProgram] = useState<Partial<Program>>({
        name: "",
        date: undefined,
        startTime: undefined,
        endTime: undefined,
        description: "",
    });

    const toast = useRef<Toast>(null);

    const nameRegex = /^[A-Za-zČĆŽŠĐčćžšđ0-9\s]{3,50}$/;
    const descriptionRegex = /^[A-Za-zČĆŽŠĐčćžšđ0-9\s.,!?'"-]{10,500}$/;

    addLocale("custom", {
        firstDayOfWeek: 1,
        dayNames: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"],
        dayNamesShort: ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
        dayNamesMin: ["Ne", "Po", "Ut", "Sr", "Če", "Pe", "Su"],
        monthNames: [
            "Januar", "Februar", "Mart", "April", "Maj", "Jun",
            "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
        ],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"],
        today: "Danas",
        clear: "Očisti"
    });

    const validate = (): boolean => {
        const newErrors: { [key: string]: string | null } = {};

        if (!newProgram.name || !nameRegex.test(newProgram.name)) {
            newErrors.name = "Naziv mora imati 3-50 karaktera (slova, brojevi, razmak).";
        }

        if (!newProgram.description || !descriptionRegex.test(newProgram.description)) {
            newErrors.description = "Opis je obavezan i mora imati 10-500 karaktera (slova, brojevi, interpunkcija).";
        }

        if (newProgram.startTime && newProgram.endTime) {
            if (newProgram.startTime >= newProgram.endTime) {
                newErrors.time = "Vreme početka mora biti pre vremena završetka.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        if (!newProgram.name || !newProgram.startTime || !newProgram.endTime || !newProgram.date || !newProgram.description) return;

        const payload: Omit<Program, "id"> = {
            name: newProgram.name!,
            date: newProgram.date!,
            startTime: newProgram.startTime!,
            endTime: newProgram.endTime!,
            location: event.location,
            description: newProgram.description || "",
        };

        try {
            if (editingId) {
                await updateProgram(event.id, editingId, { ...payload, id: editingId });
                toast.current?.show({ severity: "success", summary: "Uspeh", detail: "Aktivnost ažurirana." });
            } else {
                await addProgram(event.id, payload);
                toast.current?.show({ severity: "success", summary: "Uspeh", detail: "Aktivnost dodata." });
            }

            const updated = await fetchPrograms(event.id);
            setProgramList(updated);
            setNewProgram({
                name: "",
                date: undefined,
                startTime: undefined,
                endTime: undefined,
                description: "",
            });
            setEditingId(null);
            setVisible(false);
        } catch (err: any) {
            toast.current?.show({ severity: "error", summary: "Greška", detail: "Došlo je do greške prilikom čuvanja." });
        }
    };

    const confirmDelete = (id: string) => {
        if(event.status !== 'draft')
        {
            toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće brisati aktivnosti kada je događaj objavljen." });
            return;
        }
        confirmDialog({
            message: "Da li ste sigurni da želite da obrišete ovu aktivnost?",
            header: "Potvrda brisanja",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Da",
            rejectLabel: "Ne",
            acceptClassName: "p-button-danger",
            accept: async () => {
                try {
                    await deleteProgram(event.id, id);
                    const updated = await fetchPrograms(event.id);
                    setProgramList(updated);
                    toast.current?.show({ severity: "success", summary: "Uspeh", detail: "Aktivnost obrisana." });
                } catch (err: any) {
                    toast.current?.show({ severity: "error", summary: "Greška", detail: "Brisanje nije uspelo." });
                }
            }
        });
    };

    const handleEdit = (prog: Program) => {
        setNewProgram({
            id: prog.id,
            name: prog.name,
            description: prog.description,
            location: prog.location,
            date: prog.date ? new Date(prog.date) : undefined,
            startTime: prog.startTime ? new Date(prog.startTime) : undefined,
            endTime: prog.endTime ? new Date(prog.endTime) : undefined,
        });
        setEditingId(prog.id);
        setErrors({});
        setVisible(true);
    };

    const fetchPrograms = async (eventId: string): Promise<Program[]> => {
        const res = await api.get(`${API_URL}/api/Event/${eventId}/programs`);
        return await res.data;
    };

    const addProgram = async (eventId: string, program: Omit<Program, "id">): Promise<Program[]> => {
        const res = await api.post(`${API_URL}/api/Event/${eventId}/program`, program, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    };

    const updateProgram = async (eventId: string, programId: string, program: Program): Promise<void> => {
        await api.put(`${API_URL}/api/Event/${eventId}/program/${programId}`, program);
    };

    const deleteProgram = async (eventId: string, programId: string): Promise<void> => {
        await api.delete(`${API_URL}/api/Event/${eventId}/program/${programId}`);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchPrograms(event.id);
            setProgramList(data);
            setLoading(false);
        };
        load();
    }, [event.id]);

    if (loading) return <Spinner />;

    return (
        <div className="event-program">
            <Toast ref={toast} position="top-right" />
            <div className="header">
                <h2>Program za: {event.title}</h2>
                <Button
                    label="Dodaj aktivnost"
                    icon="pi pi-plus"
                    onClick={() => {
                        setEditingId(null);
                        setNewProgram({
                            name: "",
                            date: undefined,
                            startTime: undefined,
                            endTime: undefined,
                            description: "",
                        });
                        setErrors({});
                        setVisible(true);
                    }}
                    style={{backgroundColor: '#0353a4'}}
                />
            </div>

            <DataTable value={programList} style={{ width: "100%" }}>
                <Column field="name" header="Naziv" style={{ width: "200px" }} sortable />
                <Column field="date" header="Datum" body={(row) => new Date(row.date!).toLocaleDateString()} sortable />
                <Column field="startTime" header="Vreme početka" body={(row) => new Date(row.startTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} />
                <Column field="endTime" header="Vreme završetka" body={(row) => new Date(row.endTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })} />
                <Column field="description" header="Opis" />
                <Column
                    header="Akcije"
                    body={(row) => (
                        <>
                            <Button icon="pi pi-pencil" className="p-button-sm p-button-text mr-2" onClick={() => handleEdit(row)} />
                            <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => confirmDelete(row.id)} />
                        </>
                    )}
                />
            </DataTable>

            <Dialog header={editingId ? "Ažuriraj aktivnost" : "Dodaj aktivnost"} visible={visible} onHide={() => setVisible(false)} modal className="event-program-dialog">
                <div className="p-fluid">
                    <label htmlFor="name">Naziv</label>
                    <InputText id="name" value={newProgram.name || ""} onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })} />
                    {errors.name && <small style={{ color: "red" }}>{errors.name}</small>}

                    <label htmlFor="date">Datum</label>
                    <Calendar
                        id="date"
                        value={newProgram.date}
                        onChange={(e) => setNewProgram({ ...newProgram, date: e.value })}
                        dateFormat="dd-mm-yy"
                        minDate={new Date(event.startDate)}
                        maxDate={new Date(event.endDate)}
                        locale="custom"
                    />

                    <label htmlFor="startTime">Vreme početka</label>
                    <Calendar id="startTime" value={newProgram.startTime} onChange={(e) => setNewProgram({ ...newProgram, startTime: e.value })} timeOnly />

                    <label htmlFor="endTime">Vreme završetka</label>
                    <Calendar id="endTime" value={newProgram.endTime} onChange={(e) => setNewProgram({ ...newProgram, endTime: e.value })} timeOnly />
                    {errors.time && <small style={{ color: "red" }}>{errors.time}</small>}

                    <label htmlFor="description">Opis</label>
                    <InputTextarea id="description" value={newProgram.description || ""} onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })} style={{ textTransform: "none", resize: "none" }} />
                    {errors.description && <small style={{ color: "red" }}>{errors.description}</small>}

                    <Button label={editingId ? "Ažuriraj" : "Dodaj"} className="save-dugme" onClick={handleSave} />
                </div>
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default EventProgram;
