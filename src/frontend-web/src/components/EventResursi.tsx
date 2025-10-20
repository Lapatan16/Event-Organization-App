import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { SelectButton } from 'primereact/selectbutton';
import { TabView, TabPanel } from 'primereact/tabview';
import Spinner from '../utils/Spinner';
import { API_URL } from '../services/config';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useRef } from 'react';


import "./EventResursi.css"
import type { Event } from '../types/Event';
import type { Supplier, SupplierProduct } from '../types/Supplier';
import type { EventResource } from '../types/Event';
import api from '../services/api';
import { InputNumber } from 'primereact/inputnumber';
import ResourcesStats from './ResourcesStats';

type Props = {
    event: Event;
    setEvent: (event: Event) => void;
};

type Contract = {
    resourceId: string;
    supplierId: string;
    productId: string;
    eventId: string;
    quantity: number;
    price: number;
    status: string;
};

// Assuming API_URL is defined somewhere globally or as a constant
//const API_URL = 'https://your-api-url.com'; // Placeholder, replace with actual URL

const EventResursi = ({ event }: Props) => {
    const [spin, setSpin] = useState(true);
    const [resources, setResources] = useState<EventResource[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const toast = useRef<Toast>(null);


    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedResource, setSelectedResource] = useState<EventResource | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(0);
    
    // State for contract dialog validation errors
    const [contractErrors, setContractErrors] = useState<{ [key: string]: string }>({});

    const publicOptions = ['privatni', 'javni'];
    const [isPublic, setIsPublic] = useState<string>(publicOptions[0]);

    const [showDialog, setShowDialog] = useState(false);
    const [newResource, setNewResource] = useState<EventResource>({
        name: '',
        type: '',
        quantity: 0,
        unit: '',
        isPublic: false,
        reserved: 0,
        price: 0,
    });

    // State for new resource dialog validation errors
    const [newResourceErrors, setNewResourceErrors] = useState<{ [key: string]: string }>({});


    const resourceTypeOptions = [
        { label: 'Prostor', value: 'prostor', unit: 'm2' },
        { label: 'Oprema', value: 'oprema', unit: 'komad' },
        { label: 'Hrana', value: 'hrana', unit: 'kg' },
        { label: 'Transport', value: 'transport', unit: 'h' },
        { label: 'Osoblje', value: 'osoblje', unit: 'komad' },
        { label: 'Obezbeđenje', value: 'obezbeđenje', unit: 'h' },
        { label: 'Reklamiranje', value: 'reklamiranje', unit: 'komad' },
    ];

//     const unitOptions = [
//         { label: 'Komad', value: 'komad' },
//         { label: 'Kilogram', value: 'kg' },
//         { label: 'Litar', value: 'l' },
//         { label: 'Metar', value: 'm' },
//         { label: 'Metar Kvadratni', value: 'm2' },
//     ];

   useEffect(() => 
    {
        const loadAll = async () => {
            setSpin(true); // start spinner

            try {
                await Promise.all([
                    fetchResources(),
                    fetchSuppliers(),
                    fetchContracts(),
                ]);
            } catch (err) {
                console.error("Error loading data:", err);
            } finally {
                setSpin(false); // stop spinner only after all are done
            }
        };

        loadAll();
    }, [pageNumber, pageSize]);


    useEffect(() => {
        if (selectedProduct) {
            setQuantity(1);
            setPrice(selectedProduct.price * 1);
        }
    }, [selectedProduct]);

    const fetchResources = async () => {
        try {
            const res = await api.get(`${API_URL}/api/Event/${event.id}/resources?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            const data = await res.data;
            setResources(data.items);
            setTotalItems(data.totalItems);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        }
    };

    const fetchSuppliers = async () => {
        const res = await api.get(`${API_URL}/api/Supplier`);
        const data = await res.data;
        setSuppliers(data);
    };

    const fetchContracts = async () => {
        try {
            const res = await api.get(`${API_URL}/api/Contract/by-event/${event.id}`);
            const data = res.data;
            setContracts(data || []);
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };


    // Validation function for new resource form
    const validateNewResource = () => {
        const errors: { [key: string]: string } = {};
        if (!newResource.name) errors.name = 'Naziv je obavezno polje.';
        if (!newResource.type) errors.type = 'Tip je obavezno polje.';
        if (newResource.quantity <= 0) errors.quantity = 'Količina mora biti veća od 0.';
        if (!newResource.unit) errors.unit = 'Merna jedinica je obavezno polje.';
        if (newResource.isPublic && newResource.price <= 0) errors.price = 'Cena mora biti veća od 0 za javni resurs.';
        setNewResourceErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNewResource = async () => {
        if (!validateNewResource()) return;

        try {
            await api.put(`${API_URL}/api/Event/${event.id}/resource`, {
            name: newResource.name,
            type: newResource.type,
            quantity: newResource.quantity,
            unit: newResource.unit,
            isPublic: newResource.isPublic,
            price: newResource.price,
            });

            setShowDialog(false);
            setNewResource({
            name: '',
            type: '',
            quantity: 0,
            unit: '',
            isPublic: false,
            reserved: 0,
            price: 0,
            });
            setNewResourceErrors({});
            await fetchResources();
            toast.current?.show({
                severity: 'success',
                summary: 'Uspeh',
                detail: 'Resurs uspešno dodat.',
            });
        } catch (err: any) {
            if (err.response) {
            console.error('Failed to create resource:', err.response.data);
            toast.current?.show({
                severity: 'error',
                summary: 'Greška',
                detail: 'Resurs nije uspešno dodat.',
            });
            } else {
            console.error('Unexpected error:', err.message);
            }
        }
        };


    const deleteResource = async (resourceId: string) => {
        setSpin(true); // show spinner
        try {
            // Try to delete contracts, but ignore 404 (no contracts found)
            try {
                await api.delete(`${API_URL}/api/Contract/by-resource/${resourceId}`);
            } catch (err: any) {
                if (err.response && err.response.status !== 404) {
                    console.error('Failed to delete contracts for resource:', err.response.data);
                    return; // only stop if it's an unexpected error
                }
            }

            // Delete the resource itself
            await api.delete(`${API_URL}/api/Event/${event.id}/resource/${resourceId}`);

            // Refresh UI
            await fetchContracts();
            await fetchResources();
            toast.current?.show({
                severity: 'success',
                summary: 'Uspeh',
                detail: 'Resurs uspešno obrisan.',
            });

        } catch (err: any) {
            if (err.response) {
                console.error('Failed to delete resource:', err.response.data);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Greška',
                    detail: 'Brisanje resursa nije bilo uspešno.',
                });
            } else {
                console.error('Unexpected error:', err.message);
            }
        } finally {
            setSpin(false); // hide spinner
        }
    };

    const deleteSupplierFromResource = async (resourceId: string, supplierId: string) => {
        try {
            await api.delete(`${API_URL}/api/Contract/by-resource-supplier/${resourceId}/${supplierId}`);
            await fetchContracts(); // refresh contracts
            toast.current?.show({
                severity: 'success',
                summary: 'Uspeh',
                detail: 'Uspešno uklonjen dobavljač sa resursa.',
            });
        } catch (err: any) {
            if (err.response) {
            console.error('Failed to delete supplier from resource:', err.response.data);
            } else {
            console.error('Unexpected error:', err.message);
            }
        }
    };

    const deleteContract = async (contract: Contract) => {
        try {
            await api.delete(
            `${API_URL}/api/Contract/${contract.resourceId}/${contract.supplierId}/${contract.productId}`
            );
            await fetchContracts(); // refresh contracts
            toast.current?.show({
                severity: 'success',
                summary: 'Uspeh',
                detail: 'Uspešno uklonjen proizvod sa resursa.',
            });
        } catch (err: any) {
            if (err.response) {
            console.error('Failed to delete contract:', err.response.data);
            } else {
            console.error('Unexpected error:', err.message);
            }
        }
    };

    const confirmDeleteSupplierFromResource = (resourceId: string, supplierId: string) => {
        confirmDialog({
            message: "Da li ste sigurni da želite da uklonite ovog dobavljača sa resursa?",
            header: "Potvrda brisanja",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Da",
            rejectLabel: "Ne",
            acceptClassName: "p-button-danger",
            accept: () => deleteSupplierFromResource(resourceId, supplierId),
        });
    };

    const confirmDeleteContract = (contract: Contract) => {
        confirmDialog({
            message: "Da li ste sigurni da želite da uklonite ovaj proizvod sa resursa?",
            header: "Potvrda brisanja",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Da",
            rejectLabel: "Ne",
            acceptClassName: "p-button-danger",
            accept: () => deleteContract(contract),
        });
    };

    const buildTreeData = () => {
        return resources.map((res) => {
            const resourceContracts = contracts.filter((c) => c.resourceId === res.id);
            
            const groupedBySupplier: { [supplierId: string]: Contract[] } = {};
            for (const contract of resourceContracts) {
                if (!groupedBySupplier[contract.supplierId]) {
                    groupedBySupplier[contract.supplierId] = [];
                }
                groupedBySupplier[contract.supplierId].push(contract);
            }

            let totalResourceQuantity = 0;
            let totalResourcePrice = 0;

            const resourceNode: any = {
                key: res.id,
                data: {
                    name: res.name,
                    type: res.type.charAt(0).toUpperCase() + res.type.slice(1),
                    quantityMax: res.quantity,
                    unit: res.unit,
                    level: 'resource',
                    resource: res,
                    quantityCurrent: 0,
                    price: 0,
                    status: res.isPublic == true ? "Javni" : "Privatni",
                    resourcePrice: res.price,
                },
                children: [],
            };

            for (const [supplierId, supplierContracts] of Object.entries(groupedBySupplier)) {
                const supplier = suppliers.find((s) => s.id === supplierId);

                let totalSupplierQuantity = 0;
                let totalSupplierPrice = 0;

                const productChildren = supplierContracts.map((c) => {
                    const product = supplier?.products?.find((p) => p.id === c.productId);
                    const quantity = c.quantity;
                    const price = quantity * c.price;

                    totalSupplierQuantity += quantity;
                    totalSupplierPrice += price;

                    return {
                        key: `${res.id}-${supplierId}-${c.productId}`,
                        data: {
                            name: product?.name || 'Nepoznat proizvod',
                            quantityCurrent: quantity,
                            price: price,
                            type: res.type.charAt(0).toUpperCase() + res.type.slice(1),
                            unit: res.unit,
                            status: c.status == "sealed" ? "Prihvaćen" : "Na čekanju",
                            level: 'product',
                            contract: c,
                        },
                    };
                });

                totalResourceQuantity += totalSupplierQuantity;
                totalResourcePrice += totalSupplierPrice;

                const supplierNode: any = {
                    key: `${res.id}-${supplierId}`,
                    data: {
                        name: supplier?.name || 'Nepoznat dobavljač',
                        level: 'supplier',
                        type: res.type.charAt(0).toUpperCase() + res.type.slice(1),
                        supplier,
                        resourceId: res.id,
                        quantityCurrent: totalSupplierQuantity,
                        price: totalSupplierPrice,
                        unit: res.unit,
                    },
                    children: productChildren,
                };

                resourceNode.children.push(supplierNode);
            }

            // Finalize aggregation at resource level
            resourceNode.data.quantityCurrent = totalResourceQuantity.toString() + " / " + resourceNode.data.quantityMax.toString();
            resourceNode.data.price = totalResourcePrice;

            return resourceNode;
        });
    };


    const openDialog = (res: EventResource) => {
        setSelectedResource(res);
        setSelectedSupplier(null);
        setSelectedProduct(null);
        setQuantity(1);
        setPrice(0);
        setContractErrors({}); // Clear errors when opening
        setDialogVisible(true);
    };

    // Validation function for contract form
    const validateContract = () => {
        const errors: { [key: string]: string } = {};
        if (!selectedSupplier) errors.supplier = 'Dobavljač je obavezno polje.';
        if (!selectedProduct) errors.product = 'Proizvod je obavezno polje.';
        if (quantity <= 0) errors.quantity = 'Količina mora biti veća od 0.';
        setContractErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitContract = async () => {
        if (!validateContract()) {
            return;
        }

        if (!selectedResource || !selectedSupplier || !selectedProduct) return;

        const contract: Contract = {
            resourceId: selectedResource.id!,
            supplierId: selectedSupplier.id!,
            productId: selectedProduct.id!,
            eventId: event.id!,
            price,
            quantity,
            status: 'pending',
        };

        try {
            await api.put(`${API_URL}/api/Contract/upsert`, contract);

            // Axios automatically throws on non-2xx responses, so if we reach here, it's successful
            setDialogVisible(false);
            await fetchContracts();
            toast.current?.show({
                severity: 'success',
                summary: 'Uspeh',
                detail: 'Uspešno dodat dobavljač na resurs.',
            });
            } catch (err: any) {
            if (err.response) {
                console.error('Failed to upsert contract:', err.response.data);
            } else {
                console.error('Unexpected error:', err.message);
            }
        }
    };

    const formatPrice = (price: number) =>
        price.toLocaleString("sr-RS", {
            style: "currency",
            currency: "RSD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    
    const getQuantityStyle = (reserved: number, required: number) => {
        if (reserved < required) return { color: 'red', fontWeight: 'bold' };        // not enough reserved
        if (reserved === required) return { color: 'green', fontWeight: 'bold' };   // exactly enough
        if (reserved > required) return { color: 'orange', fontWeight: 'bold' };    // over reserved
        return {};
    };

    const confirmDeleteResource = (resource: EventResource) => {
    if(event.status !== 'draft' && resource.isPublic)
    {
        toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće brisati javne resurse kada je događaj objavljen." });
        return;
    }
    confirmDialog({
        message: 'Da li ste sigurni da želite da obrišete ovaj resurs?',
        header: 'Potvrda brisanja',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Da',
        rejectLabel: 'Ne',
        acceptClassName: 'p-button-danger',
        accept: () => deleteResource(resource.id ?? ''),
    });
    };




    if (spin) return <Spinner />;

    return (
        <div className='event-resursi-main-div'>
            <Toast ref={toast} />
            <ConfirmDialog />

        <TabView>
            <TabPanel header="Postojeći resursi">
            <div>
                <Button className="dodaj-novi-resurs" label="Dodaj novi resurs" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
                <Dialog
                    header="Dodaj novi resurs"
                    visible={showDialog}
                    style={{ width: '30vw' }}
                    onHide={() => {
                        setShowDialog(false);
                        setNewResourceErrors({}); // Clear validation errors on hide
                    }}
                >
                    <div className="p-fluid supplier-dialog-content">
                        <div className="field">
                            <label htmlFor="name">Naziv</label>
                            <InputText
                                id="name"
                                value={newResource.name}
                                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                className={newResourceErrors.name ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{newResourceErrors.name}</small>
                        </div>

                        <div className="field">
                            <label htmlFor="type">Tip</label>
                            <Dropdown
                                id="type"
                                value={newResource.type}
                                options={resourceTypeOptions}
                                onChange={(e) => {
                                    const selected = resourceTypeOptions.find(o => o.value === e.value);
                                    setNewResource({
                                        ...newResource,
                                        type: e.value,
                                        unit: selected?.unit || ''
                                    });
                                }}
                                placeholder="Odaberi tip"
                                className={newResourceErrors.type ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{newResourceErrors.type}</small>
                        </div>

                        <div className="field">
                            <label htmlFor="quantity">Količina</label>
                            <InputText
                                id="quantity"
                                type="number"
                                value={newResource.quantity.toString()}
                                onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value, 10) || 0})}
                                className={newResourceErrors.quantity ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{newResourceErrors.quantity}</small>
                        </div>

                        <div className="field" style={{marginTop: '5px'}}>
                            <label>Javni</label>
                            <SelectButton
                                className='opcija-javni'
                                options={publicOptions} 
                                value={isPublic}
                                onChange={(e) => 
                                {
                                    if (e.value !== null) 
                                    {
                                        setIsPublic(e.value);
                                        setNewResource({ ...newResource, isPublic: e.value === 'javni' });
                                    }
                                }}
                            />
                        </div>
                        
                        {newResource.isPublic && 
                        <div className="field" style={{ marginTop: '5px' }}>
                            <label>Cena</label>
                            <InputNumber
                            id="cena"
                            value={newResource.price}
                            onValueChange={(e) =>
                                setNewResource({ ...newResource, price: e.value ?? 0 })
                            }
                            mode="currency"
                            currency="RSD"
                            currencyDisplay="code"  // or "symbol" if you want dinar sign
                            locale="sr-RS"
                            className={newResourceErrors.price ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{newResourceErrors.price}</small>
                        </div>
                        }


                        <Button label="Dodaj" icon="pi pi-check" onClick={handleNewResource} />
                    </div>
                </Dialog>
            </div>
            <br />

            <TreeTable value={buildTreeData()} tableStyle={{ minWidth: '50rem' }}>
                <Column field="name" header="Naziv" expander style={{ width: '250px' }} sortable/>
                <Column field="type" header="Tip" sortable/>
{/*                 <Column field="quantityCurrent" header="Količina" /> */}
                <Column 
                    field="quantityCurrent" 
                    header="Količina" 
                    body={(node) => {
                        const data = node.data;
                        if (data.level === 'resource') {
                            const reserved = parseInt(data.quantityCurrent.split(' / ')[0], 10); // e.g., "3 / 5"
                            const max = parseInt(data.quantityCurrent.split(' / ')[1], 10);
                            return <span style={getQuantityStyle(reserved, max)}>{data.quantityCurrent}</span>;
                        }
                        // if (data.level === 'product') {
                        //     const reserved = data.quantityCurrent;
                        //     const required = data.contract?.quantity ?? 0;
                        //     return <span style={getQuantityStyle(reserved, required)}>{reserved}</span>;
                        // }
                        return <span>{data.quantityCurrent}</span>;
                    }}
                />
                <Column field="unit" header="Merna jedinica" sortable/>
                <Column field="price" header="Cena" sortable body={(node) => formatPrice(node.data.price)} style={{ width: '200px'}}/>
                <Column field="status" header="Status" body={(node) =>
                    {
                        const data = node.data;
                        if(data.level == 'resource')
                        {
                            return( 
                            <>
                                <span>{data.status}</span><br />
                                {data.status === 'Javni' && (<span>{formatPrice(data.resourcePrice)}</span>)}
                                {/* {formatPrice(data.resourcePrice)} */}
                            </>);
                        }
                        if(data.level == 'product')
                        {
                            return <span>{data.status}</span>
                        }
                    }}
                />


                <Column
                    header="Akcije"
                    body={(node) => {
                        const data = node.data;
                        if (data.level === 'resource') {
                            return (
                                <>
                                    <Button icon="pi pi-plus" className="p-button-sm p-button-text" onClick={() => openDialog(data.resource)} />
                                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => confirmDeleteResource(data.resource)} />
                                </>
                            );
                        }
                        if (data.level === 'supplier') {
                            return (
                                <>
                                    <Button icon="pi pi-plus" className="p-button-sm p-button-text" style={{ visibility: "hidden" }} /> 
                                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => confirmDeleteSupplierFromResource(data.resourceId, data.supplier.id)} />
                                </>
                            );
                        }
                        if (data.level === 'product') {
                            return (
                                <>
                                    <Button icon="pi pi-plus" className="p-button-sm p-button-text" style={{ visibility: "hidden" }} /> 
                                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => confirmDeleteContract(data.contract)} />
                                </>
                            );
                        }
                        return null;
                    }}
                />

            </TreeTable>

            <Paginator
                first={(pageNumber - 1) * pageSize}
                rows={pageSize}
                totalRecords={totalItems}
                onPageChange={(e) => {
                    setPageNumber(Math.floor(e.first / e.rows) + 1);
                    setPageSize(e.rows);
                }}
                rowsPerPageOptions={[5, 10, 20]}
            />


            <Dialog
                header="Dodaj ugovor"
                visible={dialogVisible}
                style={{ width: '30vw' }}
                onHide={() => {
                    setDialogVisible(false);
                    setContractErrors({}); // Clear validation errors on hide
                }}
            >
                <div className="p-fluid">
                    <div className="field">
                        <label>Dobavljač</label>
                        <Dropdown
                            value={selectedSupplier}
                            options={suppliers.filter((s) =>
                                s.type === selectedResource?.type && s.products && s.products.length > 0
                            )}
                            onChange={(e) => {
                                setSelectedSupplier(e.value);
                                setSelectedProduct(null);
                            }}
                            optionLabel="name"
                            placeholder="Odaberi dobavljača"
                            className={contractErrors.supplier ? 'p-invalid' : ''}
                        />
                        <small className="p-error">{contractErrors.supplier}</small>
                    </div>

                    {selectedSupplier && (
                        <div className="field">
                            <label>Proizvod</label>
                            <Dropdown
                                value={selectedProduct}
                                options={selectedSupplier.products}
                                onChange={(e) => setSelectedProduct(e.value)}
                                optionLabel="name"
                                placeholder="Odaberi proizvod"
                                className={contractErrors.product ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{contractErrors.product}</small>
                        </div>
                    )}

                    {selectedProduct &&
                        <div className="field">
                            <label>Količina</label>
                            <InputText
                                type="number"
                                value={quantity.toString()}
                                onChange={(e) => {
                                    const parsed = parseFloat(e.target.value);
                                    const newQuantity = isNaN(parsed) || parsed < 1 ? 0 : parsed;
                                    setQuantity(newQuantity);
                                    setPrice((selectedProduct?.price ?? 0) * newQuantity);
                                }}
                                className={contractErrors.quantity ? 'p-invalid' : ''}
                            />
                            <small className="p-error">{contractErrors.quantity}</small>
                        </div>
                    }   

                    {selectedProduct && (
                        <div className="field" style={{ marginTop: '10px' }}>
                            <label>Cena</label>
                            <InputNumber
                                value={price}
                                readOnly
                                mode="currency"
                                currency="RSD"
                                currencyDisplay="code" // will show "RSD", use "symbol" if you want dinar sign
                                locale="sr-RS"
                            />
                        </div>
                    )}


                    <Button label="Sačuvaj ugovor" icon="pi pi-check" onClick={submitContract} style={{marginTop: "20px"}} />
                </div>
            </Dialog>
</TabPanel>
<TabPanel header="Statistika">
  <ResourcesStats resources={resources} />
</TabPanel>

</TabView>
        </div>
    );
};

export default EventResursi;
