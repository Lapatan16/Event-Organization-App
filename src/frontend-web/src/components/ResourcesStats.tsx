import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Dropdown } from "primereact/dropdown";
import type { EventResource } from "../types/Event";  
import "./ReourcesStats.css"

type Props = {
  resources: EventResource[]; 
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const ResourcesStats: React.FC<Props> = ({ resources }) => {
 
  const publicResources = resources.filter((r) => r.isPublic);

  
  const resourceTypes = Array.from(
    new Set(publicResources.map((r) => r.type).filter((t): t is string => !!t))
  ).map((t) => ({ label: t, value: t }));

  const [selectedType, setSelectedType] = useState<string | null>(null);

  
  useEffect(() => {
    if (resourceTypes.length > 0 && !selectedType) {
      setSelectedType(resourceTypes[0].value);
    }
  }, [resourceTypes, selectedType]);

  const filteredResources = selectedType
    ? publicResources.filter((r) => r.type === selectedType)
    : [];

  const totalResources = filteredResources.length;
  const totalQuantity = filteredResources.reduce(
    (sum, r) => sum + (r.quantity || 0),
    0
  );
  const totalReserved = filteredResources.reduce(
    (sum, r) => sum + (r.reserved || 0),
    0
  );

  const totalPrice = filteredResources.reduce(
  (sum, r) => sum + ((r.quantity || 0) * (r.price || 0)),
  0
);

// Grupisanje po mernoj jedinici
const totalByUnit = filteredResources.reduce((acc, r) => {
  const unit = r.unit || "kom"; // default ako nije definisano
  const qty = r.quantity || 0;
  acc[unit] = (acc[unit] || 0) + qty;
  return acc;
}, {} as Record<string, number>);


  const chartData = filteredResources.map((r) => ({
    name: r.name,
    value: r.quantity || 0,
  }));

  return (
     <div className="stats-container">
     
      <div className="dropdown-menu">
        <h2 className="">Izaberi tip resursa</h2>
        {resourceTypes.length > 0 ? (
          <Dropdown
            value={selectedType}
            options={resourceTypes}
            onChange={(e) => setSelectedType(e.value)}
            placeholder="Odaberi tip resursa"
            className="w-full md:w-60"
          />
        ) : (
          <p className="text-gray-500">Nema dostupnih resursa</p>
        )}
      </div>

      {selectedType && (
        <div className="resources-stats">
          <h2 className="text-lg font-semibold mb-3">
              Pregled za tip: {selectedType}
            </h2>
          <div className="resources-summary">
             <div className="summary-card">
        <h3>Broj tipova resursa</h3>
        <div className='summary-card-result'> <p>{totalResources}</p></div>
    </div>
            
           <div className="summary-card">
            <h3>Ukupna količina</h3>
              <ul className="list-item">
                {Object.entries(totalByUnit).map(([unit, qty]) => (
                  <li key={unit}>
                    <b>{qty}</b> {unit}
                  </li>
                ))}
              </ul>
                  </div>
                  <div className="summary-card">
            <h3>Ukupna vrednost</h3>
            <div className='summary-card-result'> <p>{totalPrice} RSD</p></div>
                </div>
                 <div className="summary-card">
            <h3>Ukupno rezervisano</h3>
            <div className='summary-card-result'> <p>{totalReserved}</p></div>
                </div>
         
         

          <div className="summary-card">
            <h3 className="">Resursi po količini</h3>
            {chartData.length > 0 ? (
              <PieChart width={300} height={250}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
             
                  
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              
            ) : (
              <p className="text-gray-500">Nema resursa za prikaz.</p>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesStats;
