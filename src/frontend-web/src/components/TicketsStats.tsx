import React from 'react';
import { useMemo } from 'react';
import { Chart } from 'primereact/chart'; 

import "./TicketStats.css"


export type Ticket = {
   id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  sold?: number;
  date?: string;
  eventId?: string;
};
type Props = {
  tickets: Ticket[];
};

const TicketsStats: React.FC<Props> = ({ tickets }) => {
 
  
   const stats = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        bestSelling: null,
        totalRevenue: 0,
        remaining: 0,
        totalSold: 0
      };
    }

    const bestSelling = tickets.reduce((prev, curr) =>
      (curr.sold ?? 0) > (prev.sold ?? 0) ? curr : prev
    );

    const totalRevenue = tickets.reduce(
      (sum, t) => sum + (t.price ?? 0) * (t.sold ?? 0),
      0
    );

    const remaining = tickets.reduce(
      (sum, t) => sum + ((t.quantity ?? 0) - (t.sold ?? 0)),
      0
    );

      const totalSold = tickets.reduce(
        (sum, t) => sum + (t.sold ?? 0),
        0
      );

        return { bestSelling, totalRevenue, remaining, totalSold };
      }, [tickets]);

    const formatCurrency = (value: number) =>
    value.toLocaleString("sr-RS", { minimumFractionDigits: 0 });

 

    const chartData = {
    labels: tickets.map(t => t.name || "N/A"),
    datasets: [
      {
        data: tickets.map(t => t.sold ?? 0),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043'],
        hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65']
      }
    ]
  };

  const chartOptions = {
  plugins: {
    legend: {
      display: true,
      position: 'right',  
      labels: {
        usePointStyle: true, 
        boxWidth: 12,
        padding: 15
      }
    },
    datalabels: {
      display: false 
      
    }
  }
};


  return (
    <div className="tickets-stats-container">
      
      <div className="tickets-summary">
        <div className="summary-card">
        <h3>Prodato</h3>
        <div className='summary-card-result'> <p>{stats.totalSold}</p></div>
    </div>
       <div className="summary-card">
        <h3>Preostalo</h3>
        <div className='summary-card-result'> <p>{stats.remaining}</p></div>
    </div>
    <div className="summary-card">
        <h3>Ukupan prihod</h3>
        <div className='summary-card-result'><p>{formatCurrency(stats.totalRevenue)} RSD</p></div>
    </div>
    <div className="summary-card">
        <h3>Broj tipova ulaznica</h3>
        <div className='summary-card-result'><p>{tickets.length}</p></div>
    </div>
            <div className="summary-card">
        <h3>Najprodavanija ulaznica</h3>
        <Chart 
          type="pie" 
          data={chartData} 
          options={chartOptions} 
          style={{ width: '100%', maxHeight: '180px' }} 
        />
      </div>

      </div>
     

      
      <div className="tickets-details">
        {tickets.length > 0 && (
        <div className="ticket-header">
          <span>Naziv</span>
          <span>Prodato</span>
          <span>Zarađeno</span>
          <span>Preostalo</span>
        </div>
      )}
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-row">
            <div className="ticket-name">{ticket.name}</div>
            <div className="ticket-sold">{ticket.sold}</div>
            <div className="ticket-price">{ticket.price} RSD</div>
             <div className="ticket-quantity">{ticket.quantity}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TicketsStats;
