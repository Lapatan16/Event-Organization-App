// // import { useState } from 'react';
// // import { AutoComplete } from 'primereact/autocomplete';

// // type Props = 
// // {
// //     kategorija: string,
// //     setKategorija: (value: string) => void, 
// // }

// // const CategoryInput = ({kategorija, setKategorija}: Props) => {
// //     const existingCategories = ['Technology', 'Health', 'Education', 'Entertainment'];
// //     const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
// //     const [selectedCategory, setSelectedCategory] = useState<string>('');

// //     const searchCategory = (event: { query: string }) => {
// //         const query = event.query.toLowerCase();
// //         const filtered = existingCategories.filter(cat => cat.toLowerCase().includes(query));
// //         setFilteredCategories(filtered);
// //     };

// //     return (
// //         <div className="card flex justify-content-center">
// //             <AutoComplete
// //                 value={kategorija}
// //                 suggestions={filteredCategories}
// //                 completeMethod={searchCategory}
// //                 onChange={(e) => setKategorija(e.value)}
// //                 placeholder="Choose or add a category"
// //                 forceSelection={false} // allows free text
// //                 dropdown
// //             />
// //         </div>
// //     );
// // };

// // export default CategoryInput;

// import { useEffect, useState } from 'react';
// import { useUser } from '../hooks/UserContext';

// import type { Event } from '../types/Event';
// import type { Supplier } from '../types/Supplier';
// import type { SupplierProduct } from '../types/Supplier';
// import { API_URL } from '../services/config';
// import CategoryInput from './CategoryInput';
// import { Button } from 'primereact/button';
// import type { EventResource } from '../types/Event';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
// import { Dropdown } from 'primereact/dropdown';
// import Kategorije from './KategorijeResursa';

// type Props = 
// {
//     event: Event,
//     setEvent: (event: Event) => void,
// };

// const EventResursi = ({event}: Props) => 
// {
//     const [kategorija, setKategorija] = useState('');
//     const { user, loading } = useUser();
//     const [suppliers, setSuppliers] = useState<Supplier[]>();
//     const [showDialog, setShowDialog] = useState(false);
//     const [newResource, setNewResource] = useState<EventResource>({
//         name: '',
//         type: '',
//         quantity: 0,
//         unit: '',
//     });
//     const [resources, setResources] = useState<EventResource[]>([]);


//     const resourceTypeOptions = [
//         { label: 'Prostor', value: 'prostor' },
//         { label: 'Oprema', value: 'oprema' },
//         { label: 'Hrana', value: 'hrana' },
//         { label: 'Drugo', value: 'drugo' },
//     ];

//     const unitOptions = [
//         { label: 'Komad', value: 'komad' },
//         { label: 'Kilogram', value: 'kg' },
//         { label: 'Gram', value: 'g' },
//         { label: 'Litar', value: 'l' },
//         { label: 'Metar', value: 'm' },
//         { label: 'Metar Kvadratni', value: 'm2' },
//     ];

//     if(loading)
//         return <h2>Učitavanje...</h2>

//     useEffect(() =>
//     {
//         fetchSupplier();
//         fetchResources();
//     }, [])

//     const fetchSupplier = () =>
//     {
//         fetch(`${API_URL}/api/Supplier`)
//             .then(res => res.json())
//             .then((data: Supplier[]) => {
//                 setSuppliers(data);   
//         });
//     }

//     const fetchResources = async () => {
//         try {
//             const res = await fetch(`${API_URL}/api/Event/${event.id}/resources`);
//             if (!res.ok) throw new Error("Failed to fetch resources");
//             const data: EventResource[] = await res.json();
//             setResources(data);
//         } catch (err) {
//             console.error(err);
//         }
//     };


//     function handleKategorijaChange(value: string)
//     {
//         setKategorija(value);
//     }

//     const handleNewResource = async () => {
//         try {
//             const response = await fetch(`${API_URL}/api/Event/${event.id}/resource`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     // id: '',
//                     name: newResource.name,
//                     type: newResource.type,
//                     quantity: newResource.quantity,
//                     unit: newResource.unit,
//                 }),
//             });

//             if (!response.ok) {
//                 const text = await response.text();
//                 console.error('Failed to create resource:', text);
//                 return;
//             }

//             setShowDialog(false);
//             setNewResource({ name: '', type: '', quantity: 0, unit:'' });
//             await fetchResources();
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     };

//     return (
//         <div>
//             <Button label="Dodaj novi resurs" icon="pi pi-plus" onClick={() => setShowDialog(true)} />

//             {resources.map((res, i) => (
//                 <div key={i}>
//                     <strong>{res.name}</strong> - {res.quantity} {res.unit} ({res.type})
//                 </div>
//             ))}


//             <Dialog
//                 header="Dodaj novi resurs"
//                 visible={showDialog}
//                 style={{ width: '30vw' }}
//                 onHide={() => setShowDialog(false)}
//             >
//                 <div className="p-fluid supplier-dialog-content">
//                     <div className="field">
//                         <label htmlFor="name">Naziv</label>
//                         <InputText
//                             id="name"
//                             value={newResource.name}
//                             onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
//                         />
//                     </div>

//                     <div className="field">
//                         <label htmlFor="type">Tip</label>
//                         <Dropdown
//                             id="type"
//                             value={newResource.type}
//                             options={resourceTypeOptions}
//                             onChange={(e) => setNewResource({ ...newResource, type: e.value })}
//                             placeholder="Odaberi tip"
//                         />
//                     </div>

//                     <div className="field">
//                         <label htmlFor="quantity">Količina</label>
//                         <InputText
//                             id="quantity"
//                             keyfilter="int"
//                             value={newResource.quantity.toString()}
//                             onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || 0 })}
//                         />
//                     </div>

//                     <div className="field">
//                         <label htmlFor="unit">Jedinica mere</label>
//                         <Dropdown
//                             id="unit"
//                             value={newResource.unit}
//                             options={unitOptions}
//                             onChange={(e) => setNewResource({ ...newResource, unit: e.value })}
//                             placeholder="Odaberi jedinicu"
//                         />
//                     </div>

//                     <Button label="Dodaj" icon="pi pi-check" onClick={handleNewResource} />
//                 </div>
//             </Dialog>
//         </div>
//     );
// };

// export default EventResursi;
