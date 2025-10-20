import { useEffect, useRef, useState } from "react";
import { useUser } from "../hooks/UserContext";
import { API_URL } from "../services/config";

import { Button } from "primereact/button";
import "./SupplierResources.css";
import { InputText } from "primereact/inputtext";
import { type Supplier, type SupplierProduct } from "../types/Supplier";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import api from "../services/api";
import type { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";


// -------------------- REGEX & VALIDACIJA --------------------
const reNaziv = /^[A-Za-zČĆŽŠĐčćžšđ0-9 .,'"-]{2,60}$/; // 2-60, slova/brojevi/razmak/osnovna interpunkcija
const reOpis = /^[\s\S]{10,1000}$/; // 10-1000 karaktera
const reCena = /^(?:0|[1-9]\d*)(?:[.,]\d{1,2})?$/; // pozitivan broj, do 2 decimale (.,)
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // jednostavan email
const reTelefonRS = /^(?:\+381|0)\s?(?:6\d)(?:[\s-]?\d){6,7}$/;// sr mobilni: +3816x... ili 06x...
const allowedTipValues = ["prostor", "oprema", "hrana", "drugo"];

const isKontaktValid = (v: string) => {
  const trimmed = v.trim();
  return reEmail.test(trimmed) || reTelefonRS.test(trimmed);
};

const normalizePrice = (v: string) => Number(v.replace(",", "."));

// ------------------------------------------------------------

const SupplierResources = () => {
  const { user, loading } = useUser();

  const [naziv, setNaziv] = useState("");
  const [tip, setTip] = useState<string>("");
  const [kontakt, setKontakt] = useState("");
  const [deskripcija, setDeskripcija] = useState("");
  const [supplier, setSupplier] = useState<Supplier>();
  const [originalSupplier, setOriginalSupplier] = useState<Supplier>(); // << DODATO
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [mogucaIzmena, setMogucaIzmena] = useState(false);
  const [unit, setUnit] = useState('');
  const toast = useRef<Toast>(null);

  // Greške za glavni formular
  const [errors, setErrors] = useState({
    naziv: "",
    tip: "",
    kontakt: "",
    deskripcija: "",
  });

  // State za novi proizvod + greške
  const [newProduct, setNewProduct] = useState({
    name: "",
    amount: "",
    unit: unit,
    price: "",
  });
  const [productErrors, setProductErrors] = useState({
    name: "",
    unit: "",
    price: "",
  });

  const handleUnitSet = (type: string) =>
  {
    if(type === 'hrana')
      setUnit('kg');
    else if(type === 'prostor')
      setUnit('m2');
    else if(type === 'oprema')
      setUnit('komad');
    else if(type === 'transport')
      setUnit('h');
    else if(type === 'osoblje')
      setUnit('komad');
    else if(type === 'obezbeđenje')
      setUnit('h');
    else if(type === 'reklamiranje')
      setUnit('komad');
  }

  // ------------ FETCH SUPPLIER ------------
  const fetchSupplier = async () => {
    try {
      const res = await api.get(`${API_URL}/api/Supplier/by-supplier/${user?.id}`);
      const data: Supplier[] = res.data;

      if (data && data.length > 0) {
        const supplier = data[0];
        setSupplier(supplier);
        setOriginalSupplier(supplier); // << DODATO
        setNaziv(supplier.name || "");
        setTip(supplier.type || "");
        handleUnitSet(supplier.type);

        setKontakt(supplier.contact || "");
        setDeskripcija(supplier.description || "");
        setNewProduct({ name: "", amount: "", unit: unit, price: "" });
      }
    } catch (err: any) {
      if (err.response) {
        console.error("Failed to fetch or create supplier:", err.response.data);
      } else {
        console.error("Unexpected error fetching or creating supplier:", err.message);
      }
    }
  };


  useEffect(() => {
    if (!loading) fetchSupplier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return <h2>Korisnik se učitava...</h2>;

  // Resetovanje grešaka kada se pređe u mod za izmenu
  useEffect(() => {
    if (mogucaIzmena) {
      setErrors({ naziv: "", tip: "", kontakt: "", deskripcija: "" });
    }
  }, [mogucaIzmena]);

  // ------------ VALIDACIJA FORME (dobavljač) ------------
  const validateNaziv = (value: string) => {
    setErrors(prev => ({ ...prev, naziv: reNaziv.test(value.trim()) ? "" : "Naziv mora imati 2–60 karaktera (slova/brojevi/razmak)." }));
  };

  const validateTip = (value: string) => {
    setErrors(prev => ({ ...prev, tip: allowedTipValues.includes(value) ? "" : "Odaberite tip (Prostor, Oprema, Hrana ili Drugo)." }));
  };

  const validateKontakt = (value: string) => {
    setErrors(prev => ({ ...prev, kontakt: isKontaktValid(value) ? "" : "Unesite validan email ili srpski broj telefona (npr. +3816x... ili 06x...)." }));
  };

  const validateDeskripcija = (value: string) => {
    setErrors(prev => ({ ...prev, deskripcija: reOpis.test(value.trim()) ? "" : "Opis mora imati između 10 i 1000 karaktera." }));
  };

  const canSaveSupplier = () => {
    return (
      reNaziv.test(naziv.trim()) &&
      allowedTipValues.includes(tip) &&
      isKontaktValid(kontakt) &&
      reOpis.test(deskripcija)
    );
  };

  // ------------ SUBMIT FORME (dobavljač) ------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ponovo validiramo sve na submit
    validateNaziv(naziv);
    validateTip(tip);
    validateKontakt(kontakt);
    validateDeskripcija(deskripcija);

    if (!canSaveSupplier()) return;

    if (!supplier?.id) {
      console.error("Supplier ID is missing");
      return;
    }

    try {
      await api.put(`${API_URL}/api/Supplier/${supplier.id}`, {
        supplierId: user?.id,
        poster: "",
        name: naziv.trim(),
        type: tip,
        contact: kontakt.trim(),
        description: deskripcija,
      });

      setMogucaIzmena(false);
      await fetchSupplier();
    } catch (err: any) {
      if (err.response) {
        console.error(err.response.data);
      } else {
        console.error('Unexpected error updating supplier:', err.message);
      }
    }
  };

  const confirmDeleteProduct = (productId: string) => {
  confirmDialog({
    message: "Da li ste sigurni da želite da obrišete ovaj proizvod?",
    header: "Potvrda brisanja",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Da",
    rejectLabel: "Ne",
    acceptClassName: "p-button-danger",
    accept: async () => {
      try {
        await api.delete(`${API_URL}/api/Supplier/${supplier?.id}/product/${productId}`);
        await fetchSupplier();
        toast.current?.show({ severity: "success", summary: "Uspeh", detail: "Proizvod obrisan." });
      } catch (err: any) {
        toast.current?.show({ severity: "error", summary: "Greška", detail: "Brisanje proizvoda nije uspelo." });
        console.error("Error deleting product:", err.response?.data ?? err.message);
      }
    }
  });
  }


  const deleteButtonTemplate = (rowData: SupplierProduct) => {
    return (
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        className="p-button-sm p-button-danger p-button-text"
        onClick={() => confirmDeleteProduct(rowData.id)}
      />
    );
  };

  const priceTemplate = (rowData: SupplierProduct) => {
    return rowData.price.toLocaleString("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ------------ VALIDACIJA PROIZVODA ------------
  const validateProductName = (value: string) => {
    setProductErrors(prev => ({ ...prev, name: reNaziv.test(value.trim()) ? "" : "Naziv mora imati 2–60 karaktera (slova/brojevi/razmak)." }));
  };

  const validateProductPrice = (value: string) => {
    let errorMsg = "";
    if (!reCena.test(value.trim())) {
      errorMsg = "Cena mora biti pozitivan broj (do 2 decimale).";
    } else if (normalizePrice(value) < 0) {
      errorMsg = "Cena ne može biti negativna.";
    }
    setProductErrors(prev => ({ ...prev, price: errorMsg }));
  };


  const canAddProduct = () => {
    return (
      reNaziv.test(newProduct.name.trim()) &&
      reCena.test(newProduct.price.trim()) &&
      normalizePrice(newProduct.price) >= 0
    );
  };

  // ------------ DODAVANJE PROIZVODA ------------
  const handleAddProduct = async () => {
    // Validacija pre slanja
    validateProductName(newProduct.name);
    validateProductPrice(newProduct.price);

    if (!canAddProduct()) return;

    try {
      await api.put(`${API_URL}/api/Supplier/${supplier?.id}/product`, {
        id: "",
        name: newProduct.name.trim(),
        amount: 1, // ostavljeno 1 kao u originalu
        unit: newProduct.unit,
        price: normalizePrice(newProduct.price),
      });

      // Reset UI after success
      setShowAddDialog(false);
      setNewProduct({ name: "", amount: "", unit: unit, price: "" });
      setProductErrors({ name: "", unit: "", price: "" });

      await fetchSupplier();
    } catch (err: any) {
      if (err.response) {
        console.error("Failed to add product:", err.response.data);
      } else {
        console.error("Unexpected error adding product:", err.message);
      }
    }
  };

  return (
    <div className="supplier-ponude">
    <ConfirmDialog />
      <div className="ponude-wrapper">
        <div className="ponude-left">
          <form onSubmit={handleSubmit}>
{/*             <div className="poster">
              <ImageUploader imageData={image} onImageUpload={setImage} label="Informacije o firmi" />
            </div> */}

            <div className="informacije">
                <h2>Informacije o firmi</h2>
              <div className="info-big">
                <div className="info-left">
                  <label>Naziv</label>
                  <InputText
                    disabled={!mogucaIzmena}
                    placeholder="Naziv"
                    value={naziv}
                    onChange={(e) => { setNaziv(e.target.value); validateNaziv(e.target.value); }}
                    className={errors.naziv ? "p-invalid" : ""}
                  />
                  {errors.naziv && <small className="p-error">{errors.naziv}</small>}

                  <label>Tip</label>
                  <InputText
                    value={tip.charAt(0).toUpperCase() + tip.slice(1)}
                    disabled
                   />

                  <label>Kontakt (email ili telefon)</label>
                  <InputText
                    disabled={!mogucaIzmena}
                    placeholder="npr. kontakt@firma.rs ili +3816xxxxxxx"
                    value={kontakt}
                    onChange={(e) => { setKontakt(e.target.value); validateKontakt(e.target.value); }}
                    className={errors.kontakt ? "p-invalid" : ""}
                  />
                  {errors.kontakt && <small className="p-error">{errors.kontakt}</small>}
                </div>

                <div className="info-right">
                  <label>Deskripcija</label>
                  <InputTextarea
                    disabled={!mogucaIzmena}
                    placeholder="Deskripcija"
                    value={deskripcija}
                    onChange={(e) => { setDeskripcija(e.target.value); validateDeskripcija(e.target.value); }}
                    style={{ textTransform: "none", resize: "none" }}
                    className={errors.deskripcija ? "p-invalid" : ""}
                  />
                  {errors.deskripcija && <small className="p-error">{errors.deskripcija}</small>}
                </div>
              </div>

              <div className="buttons">
                {mogucaIzmena ? (
                  <div>
                    <div>
                      <Button type="button" onClick={() => {
                        setMogucaIzmena(false);
                        if (originalSupplier) { // << DODATO
                          setNaziv(originalSupplier.name || "");
                          setKontakt(originalSupplier.contact || "");
                          setDeskripcija(originalSupplier.description || "");
                        }
                        setErrors({ naziv: "", tip: "", kontakt: "", deskripcija: "" });
                      }}>
                        Otkaži
                      </Button>
                    </div>
                    <div>
                      <Button type="submit" disabled={!canSaveSupplier()}>
                        Sačuvaj
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button type="button" onClick={() => setMogucaIzmena(true)}>
                      Izmeni
                    </Button>
                  </div>
                )}
              </div>      
            </div>
          </form>
        </div>

        <div className="ponude-right">
          <div className="ponude">
            <div className="ponude-naslov">
              <div>
                <h2>Proizvodi</h2>
              </div>
              <div>
                <Button style={{backgroundColor: "#0353a4"}} label="Dodaj proizvod" icon="pi pi-plus" onClick={() => {
                  setProductErrors({ name: "", unit: "", price: "" });
                  setShowAddDialog(true);
                }} />
            </div>
          </div>

            <div className="mapped-ponude">
              <DataTable
                value={supplier?.products}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                stripedRows
                tableStyle={{ minWidth: "40rem" }}
              >
                <Column field="name" header="Naziv" sortable />
                <Column field="amount" header="Količina" sortable />
                <Column field="unit" header="Merna jedinica" sortable />
                <Column body={priceTemplate} header="Cena" sortable />
                <Column body={deleteButtonTemplate} header="Akcije" />
              </DataTable>

              <Dialog
                header="Dodaj novi proizvod"
                visible={showAddDialog}
                style={{ width: "30vw", maxWidth: 540 }}
                onHide={() => {
                  setShowAddDialog(false);
                  setNewProduct({ name: "", amount: "", unit: unit, price: "" });
                  setProductErrors({ name: "", unit: "", price: "" });
                }}
              >
                <div className="p-fluid supplier-dialog-content">
                  <div className="field">
                    <label htmlFor="name">Naziv</label>
                    <InputText
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => { setNewProduct({ ...newProduct, name: e.target.value }); validateProductName(e.target.value); }}
                      className={productErrors.name ? "p-invalid" : ""}
                    />
                    {productErrors.name && <small className="p-error">{productErrors.name}</small>}
                  </div>

                  <div className="field">
                    <label htmlFor="price">
                      Cena po {unit}
                      {unit === "komad" ? "u" : ""}
                    </label>
                    <InputText
                      id="price"
                      value={newProduct.price}
                      onChange={(e) => { setNewProduct({ ...newProduct, price: e.target.value }); validateProductPrice(e.target.value); }}
                      placeholder="npr. 1200 ili 1200,50"
                      className={productErrors.price ? "p-invalid" : ""}
                    />
                    {productErrors.price && <small className="p-error">{productErrors.price}</small>}
                  </div>

                  <Button label="Dodaj" icon="pi pi-check" onClick={handleAddProduct} disabled={!canAddProduct()} />
                </div>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierResources;