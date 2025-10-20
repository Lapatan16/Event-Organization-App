import './FilterBar.css'
import React from "react";
import "./FilterBar.css"; // uvoz CSS-a

const FilterBar: React.FC = () => {
  return (
    <div className="filter-container">
      <div className="filter-group">
        <label>Valuta</label>
        <select>
          <option value="eur">EUR</option>
          <option value="usd">USD</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Događaji</label>
        <select>
          <option value="all">Svi Događaji</option>
          <option value="koncert">Koncerti</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Datum poretka</label>
        <select>
          <option value="30days">Poslednjih 30 dana</option>
          <option value="7days">Poslednjih 7 dana</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Datum posećenosti</label>
        <select>
          <option value="all">Svi Datumi</option>
          <option value="custom">Prilagođeni datum</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Prikaži rezultate za</label>
        <select>
          <option value="tickets">Karte</option>
          <option value="visits">Posećenost</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
