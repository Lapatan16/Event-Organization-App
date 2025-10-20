import { useEffect, useState } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { API_URL } from "../services/config";
import { useUser } from "../hooks/UserContext";
import type { Supplier } from "../types/Supplier";
import type { Contract } from "../types/Contract";
import type { TreeNode } from "primereact/treenode";

import "./SupplierOrders.css"
import api from "../services/api";
import Spinner from "../utils/Spinner";

type EventWithTitles = {
  id: string;
  title: string;
};

const SupplierOrders = () => {
  const { user } = useUser();
  const [supplier, setSupplier] = useState<Supplier>();
  const [contracts, setContracts] = useState<Contract[]>();
  const [nodes, setNodes] = useState<TreeNode[]>();
  const [events, setEvents] = useState<EventWithTitles[]>();
  const [eventTitleMap, setEventTitleMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  console.log(events, contracts);
  
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`${API_URL}/api/Supplier/by-supplier/${user.id}`);
        const data: Supplier[] = res.data;

        if (data && data.length > 0) {
          setSupplier(data[0]);
        }
      } catch (err: any) {
        if (err.response) {
          console.error('Failed to fetch supplier:', err.response.data);
        } else {
          console.error('Unexpected error fetching supplier:', err.message);
        }
      }
    };

    fetchSupplier();
  }, [user?.id]);


  useEffect(() => {
    const fetchContractsAndEvents = async () => {
      if (!supplier?.id) return;

      try {
        // Fetch contracts
        const contractRes = await api.get(`${API_URL}/api/Contract/by-supplier/${supplier.id}`);
        const contractData: Contract[] = contractRes.data;
        setContracts(contractData);
        setIsLoading(false);

        // Get unique event IDs
        const uniqueEventIds = [...new Set(contractData.map((c) => c.eventId))];

        // Fetch events in parallel
        const eventFetches = uniqueEventIds.map(async (eventId) => {
          try {
            const res = await api.get(`${API_URL}/api/Event/event-title/${eventId}`);
            return res.data as EventWithTitles;
          } catch (err: any) {
            console.warn(`Failed to fetch event with id ${eventId}:`, err.response?.data || err.message);
            return null;
          }
        });

        const eventsArray = await Promise.all(eventFetches);
        const validEvents = eventsArray.filter((e): e is EventWithTitles => e !== null);
        setEvents(validEvents);

        // Build event title map
        const eventMap = new Map<string, string>();
        validEvents.forEach((e) => eventMap.set(e.id, e.title));
        setEventTitleMap(eventMap);

        // Build tree
        const tree = buildTreeData(contractData, eventMap);
        setNodes(tree);
      } catch (err: any) {
        console.error("Error fetching contracts or events:", err.response?.data || err.message);
      }
    };

    fetchContractsAndEvents();
  }, [supplier?.id]);


  const buildTreeData = (contracts: Contract[], eventTitleMap: Map<string, string>): TreeNode[] => {
    const eventMap: { [eventId: string]: TreeNode } = {};

    contracts.forEach((contract) => {
      const eventId = contract.eventId;
      if (!eventId) return;

      const eventTitle = eventTitleMap.get(eventId) ?? eventId;

      if (!eventMap[eventId]) {
        eventMap[eventId] = {
          key: eventId,
          data: {
            name: eventTitle,
            level: "event",
            aggregatedPrice: 0,
            aggregatedQuantity: 0,
            unit: "",
          },
          children: [],
        };
      }

      const totalPrice = contract.price;
      const totalKolicina = contract.quantity;

      eventMap[eventId].children!.push({
        key: contract.id,
        data: {
          name: supplier?.products.find((e) => e.id === contract.productId)?.name ?? "Nepoznat proizvod",
          quantity: contract.quantity,
          unit: (supplier?.products.find((e) => e.id === contract.productId)?.unit ?? "Nepoznata merna jedinica"),
          price: contract.price,
          status: contract.status,
          level: "contract",
          contractId: contract.id,
        },
      });

      eventMap[eventId].data.aggregatedPrice += totalPrice;
      eventMap[eventId].data.aggregatedQuantity += totalKolicina;
    });

    return Object.values(eventMap);
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value == null) return "";
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const sealContract = async (contractId: string) => {
    try {
      await api.put(`${API_URL}/api/Contract/Contract/${contractId}/seal`);

      // Update local state
      setContracts((prev) => {
        const updated = prev?.map((c) =>
          c.id === contractId ? { ...c, status: "sealed" } : c
        );
        if (updated) {
          setNodes(buildTreeData(updated, eventTitleMap));
        }
        return updated;
      });
    } catch (err: any) {
      if (err.response) {
        console.error("Failed to seal contract:", err.response.data);
      } else {
        console.error("Unexpected error sealing contract:", err.message);
      }
    }
  };

  if(isLoading) return <Spinner />


  return (
    <div className="supplier-orders">
      <h2>Moji ugovori po događaju</h2>
      <TreeTable value={nodes} tableStyle={{ minWidth: "50rem", width: "50rem" }}>
        <Column field="name" header="Naziv" expander style={{ width: "320px" }} sortable />
        <Column
          sortable
          field="price"
          header="Cena"
          body={(node) => {
            const data = node.data;
            if (data.level === "event") {
              return formatCurrency(data.aggregatedPrice);
            }
            return formatCurrency(data.price);
          }}
        />
        <Column
          field="quantity"
          header="Količina"
          body={(node) => {
            const data = node.data;
            if (data.level === "event") {
              return data.aggregatedQuantity + " " + data.unit;
            }
            return data.quantity + " " + data.unit;
          }}
        />

        <Column
          field="status"
          header="Status"
          body={(node) => {
            const data = node.data;
            if (data.level !== "contract") return null;

            if (data.status === "pending") {
              return (
                <Button
                  label="Prihvati"
                  icon="pi pi-check"
                  severity="warning"
                  onClick={() => sealContract(data.contractId)}
                  size="small"
                />
              );
            }

            return <span style={{ fontWeight: "bold", color: "green" }}>Prihvaćen</span>;
          }}
        />
      </TreeTable>
    </div>
  );
};

export default SupplierOrders;
