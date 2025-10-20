import { useState, useMemo, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./Resursi.css";

import SortMenu from "../components/SortMenu";
import { API_URL } from "../services/config";

import type { Supplier } from "../types/Supplier";
import Spinner from "../utils/Spinner";
import api from "../services/api";
import { Toast } from "primereact/toast";
  import { useRef } from "react";

const Resursi = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [kategorije, setKategorije] = useState<string[]>([]);
  const [selektovanaKategorija, setSelektovanaKategorija] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchResource, setSearchResource] = useState("");
  const [sortedSuppliers, setSortedSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);


  const [detaljiSupplier, setDetaljiSupplier] = useState<Supplier | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [favorites, setFavorites] = useState<Supplier[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const organizerId = localStorage.getItem("userId");

  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await api.get<any[]>(`${API_URL}/api/Supplier`);
        const data: Supplier[] = res.data.map((s) => ({
          id: s._id || s.id, // normalize backend _id to id
          supplierId: s.supplierId,
          type: s.type,
          name: s.name,
          poster: s.poster,
          contact: s.contact,
          description: s.description,
          products: s.products || [],
        }));

        setSuppliers(data);

        const types = [...new Set(data.map((r) => r.type))];
        setKategorije(["Sve kategorije", ...types]);
        setSelektovanaKategorija("Sve kategorije");
      } catch (err: any) {
        console.error("Error fetching suppliers:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!organizerId) return;
      setLoadingFavorites(true);

      try {
        const res = await api.get<any[]>(`${API_URL}/api/FavoriteSupplier/${organizerId}`);
        const data: Supplier[] = res.data.map((s) => ({
          id: s._id || s.id,
          supplierId: s.supplierId,
          type: s.type,
          name: s.name,
          poster: s.poster,
          contact: s.contact,
          description: s.description,
          products: s.products || [],
        }));

        setFavorites(data);
      } catch (err: any) {
        console.error("Error fetching favorites:", err.response?.data || err.message);
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [organizerId]);

  const filtriraneKategorije = useMemo(
    () => kategorije.filter((kat) => kat.toLowerCase().includes(searchCategory.toLowerCase())),
    [kategorije, searchCategory]
  );

  const resursiZaKategoriju = useMemo(() => {
    if (selektovanaKategorija?.toLowerCase() === "sve kategorije") {
      return suppliers;
    }
    return suppliers.filter((r) => r.type.toLowerCase() === selektovanaKategorija?.toLowerCase());
  }, [suppliers, selektovanaKategorija]);

  const prikazaniResursi = useMemo(
    () =>
      sortedSuppliers.filter((r) =>
        r.name.toLowerCase().includes(searchResource.toLowerCase())
      ),
    [sortedSuppliers, searchResource]
  );

  useEffect(() => {
    setSortedSuppliers(resursiZaKategoriju);
  }, [resursiZaKategoriju]);

  const handleSorted = (sorted: Supplier[]) => {
    setSortedSuppliers(
      sorted.filter((r) => r.name.toLowerCase().includes(searchResource.toLowerCase()))
    );
  };

  const prikaziDetalje = (resurs: Supplier) => {
    setDetaljiSupplier(resurs);
    setShowDetailsDialog(true);
  };

  const toggleFavorite = async (supplier: Supplier) => {
    if (!organizerId) return;

    const isFav = favorites.some((f) => f.id === supplier.id);

    try {
      if (isFav) {
        await api.delete(`${API_URL}/api/FavoriteSupplier/${organizerId}/${supplier.id}`);
        setFavorites((prev) => prev.filter((f) => f.id !== supplier.id));
        toast.current?.show({ severity: "info", summary: "Omiljeni dovavljači", detail: "Dobavljač uspešno izbrisan iz liste omiljenih." });
      } else {
        await api.post(`${API_URL}/api/FavoriteSupplier/${organizerId}/${supplier.id}`);
        setFavorites((prev) => [...prev, supplier]);
        toast.current?.show({ severity: "info", summary: "Omiljeni dovavljači", detail: "Dobavljač uspešno dodat u listu omiljenih." });
      }
    } catch (err: any) {
      console.error("Error toggling favorite:", err.response?.data || err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="resursi-layout">
      <Toast ref={toast} />
      <aside className="sidebar">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pretraži kategorije"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="search-input"
          />
        </div>

        <nav className="category-list">
          {filtriraneKategorije.map((kat) => (
            <button
              key={kat}
              className={selektovanaKategorija === kat ? "category-btn selected" : "category-btn"}
              onClick={() => {
                setSelektovanaKategorija(kat);
                setSearchResource("");
              }}
            >
              {capitalize(kat)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {selektovanaKategorija && (
          <div className="toolbar">
            <SortMenu data={resursiZaKategoriju} onSorted={handleSorted} />

            <div className="search-wrapper content-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={`Pretraži: ${
                  selektovanaKategorija === "Sve kategorije"
                    ? "sve resurse"
                    : selektovanaKategorija
                }`}
                value={searchResource}
                onChange={(e) => setSearchResource(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}

        <TabView className="my-tabview">
          <TabPanel header="Svi dobavljači">
            {prikazaniResursi.map((resurs) => (
              <article key={resurs.id} className="card">
                <div className="avatar">{resurs.name[0]}</div>
                <div className="card-info">
                  <h2 className="card-title">{capitalize(resurs.name)}</h2>
                </div>

                <div className="card-actions">
                  <i
                    className={favorites.some((f) => f.id === resurs.id) ? "pi pi-star-fill" : "pi pi-star"}
                    style={{
                      color: favorites.some((f) => f.id === resurs.id) ? "#0353a4" : "#999",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleFavorite(resurs)}
                  />

                  <Button
                    icon="pi pi-info-circle"
                    onClick={() => prikaziDetalje(resurs)}
                    label="Više informacija o dobavljaču"
                    className="more-btn"
                  />
                </div>
              </article>
            ))}

            {!loading && selektovanaKategorija && prikazaniResursi.length === 0 && (
              <p>Nema rezultata.</p>
            )}
          </TabPanel>

          <TabPanel header="Omiljeni">
            {loadingFavorites ? (
              <Spinner />
            ) : favorites.length === 0 ? (
              <p>Nema omiljenih dobavljača.</p>
            ) : (
              favorites.map((resurs) => (
                <article key={resurs.id} className="card">
                  <div className="avatar">{resurs.name[0]}</div>
                  <div className="card-info">
                    <h2 className="card-title">{capitalize(resurs.name)}</h2>
                  </div>
                  <div className="card-actions">
                    <i
                      className="pi pi-star-fill"
                      style={{ color: "#0353a4", fontSize: "1.5rem", cursor: "pointer" }}
                      onClick={() => toggleFavorite(resurs)}
                    />
                    <Button
                      icon="pi pi-info-circle"
                      onClick={() => prikaziDetalje(resurs)}
                      label="Više informacija o dobavljaču"
                      className="more-btn"
                    />
                  </div>
                </article>
              ))
            )}
          </TabPanel>
        </TabView>
      </main>

      <Dialog
        header="Informacije"
        visible={showDetailsDialog}
        onHide={() => setShowDetailsDialog(false)}
        footer={<></>}
      >
        {detaljiSupplier ? (
          <div>
            <p><strong>Naziv:</strong> {capitalize(detaljiSupplier.name)}</p>
            <p><strong>Kategorija:</strong> {capitalize(detaljiSupplier.type)}</p>
            <p><strong>Kontakt:</strong> {detaljiSupplier.contact}</p>
            <p><strong>Opis:</strong> {detaljiSupplier.description}</p>
            <p><strong>Proizvodi:</strong></p>
            <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "0.5rem" }}>
              {detaljiSupplier.products.map((product) => (
                <div key={product.id} style={{ padding: "8px 0", borderBottom: "1px solid #ccc" }}>
                  <div><strong>Naziv:</strong> {product.name}</div>
                  <div><strong>Cena:</strong> {product.price} RSD / {product.unit}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Učitavanje...</p>
        )}
      </Dialog>
    </div>
  );
};

export default Resursi;
