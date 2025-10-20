import React from 'react';

import './ListaResursa.css'

type ListaResursaProps = {
  stavke: string[];
   selektovan: string | null;
  onKlik: (stavka: string) => void;
};

const ListaResursa: React.FC<ListaResursaProps> = ({ stavke, selektovan, onKlik }) => {
  return (
    <div className="lista-resursa">
      {stavke.map((stavka, index) => (
        <button key={index} 
        className={`resurs-dugme ${selektovan === stavka ? 'selektovan' : ''}`}
          onClick={() => onKlik(stavka)}
        >
          {stavka}
          <span className="strelica">▶</span>
        </button>
      ))}
    </div>
  );
};

export default ListaResursa;
