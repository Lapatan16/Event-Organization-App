import React from 'react';

import './KategorijeResursa.css'

type KategorijeProps = {
  kategorije: string[];
  selektovana: string | null;
  onKlik: (kategorija: string) => void;
};

const Kategorije: React.FC<KategorijeProps> = ({ kategorije, selektovana, onKlik }) => {
  return (
    <div className="resources-category">
      <ul className="category-list">
        {kategorije.map((kategorija) => (
          <li key={kategorija}>
            <button
              className={`category-button ${selektovana === kategorija ? 'active' : ''}`}
              onClick={() => onKlik(kategorija)}
            >
              {kategorija}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Kategorije;
