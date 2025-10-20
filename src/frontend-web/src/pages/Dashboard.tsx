import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { type OrganizerAnalytics } from "../types/OrganizerAnalytics";
import { useUser } from "../hooks/UserContext";
import api from "../services/api";
import Spinner from "../utils/Spinner";
import { API_URL } from "../services/config";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useUser();
  const [data, setData] = useState<OrganizerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const sliceColors = [
    "#f97316", "#3b82f6", "#16a34a", "#7c3aed", "#f43f5e", "#eab308", "#14b8a6", "#8b5cf6"
    ];

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        const res = await api.get<OrganizerAnalytics>(
          `${API_URL}/api/analytics/organizer/${user.id}/overview`
        );

        setData({
          totals: res.data.totals ?? {
            totalRevenue: 0,
            totalTicketRevenue: 0,
            totalResourceRevenue: 0,
            totalTicketsSold: 0,
            totalResourcesReserved: 0,
            eventCount: 0,
          },
          revenueByMonth: res.data.revenueByMonth ?? [],
          topEventsByRevenue: res.data.topEventsByRevenue ?? [],
          topEventsByTicketsSold: res.data.topEventsByTicketsSold ?? [],
          topTickets: res.data.topTickets ?? [],
          topResources: res.data.topResources ?? [],
          events: res.data.events ?? [],
          organizerId: res.data.organizerId ?? "",
        });
      } catch (err) {
        console.error("Neuspešno učitavanje analitike:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) return <Spinner />;
  if (!data) return <div className="dashboard-no-data">Nema dostupnih podataka.</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, padding: 8 } },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }, // hide default legend
  };

  const revenueByMonthData = {
    labels: data.revenueByMonth.map((p) => p.period),
    datasets: [
      { label: "Prihod", data: data.revenueByMonth.map((p) => p.value), backgroundColor: "#2563eb" },
    ],
  };

  const topEventsRevenueData = {
    labels: data.topEventsByRevenue.map((e) => e.name),
    datasets: [
      { label: "Prihod", data: data.topEventsByRevenue.map((e) => e.value), backgroundColor: "#7c3aed" },
    ],
  };

  const topTicketsData = {
    labels: data.topTickets.filter(t => t.value > 0).map(t => t.name),
    datasets: [
      {
        label: "Prodate karte",
        data: data.topTickets.filter(t => t.value > 0).map(t => t.value),
        backgroundColor: data.topTickets.filter(t => t.value > 0).map((_, idx) => sliceColors[idx % sliceColors.length]),
      },
    ],
  };

  const topResourcesData = {
    labels: data.topResources.filter(r => r.value > 0).map(r => r.name),
    datasets: [
      {
        label: "Rezervisano",
        data: data.topResources.filter(r => r.value > 0).map(r => r.value),
        backgroundColor: data.topResources.filter(r => r.value > 0).map((_, idx) => sliceColors[idx % sliceColors.length]),
      },
    ],
  };

  const renderLegend = (chartData: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] }) => (
    <div className="pie-legend">
      {chartData.labels.map((label, index) => (
        <div key={index} className="pie-legend-item">
          <span
            className="pie-legend-color"
            style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
          />
          {label} ({chartData.datasets[0].data[index]})
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-kpis">
        <Card className="dashboard-card" title="Ukupan prihod">
          <p className="dashboard-value text-green">{`${data.totals.totalRevenue.toFixed(2)} RSD`}</p>
        </Card>
        <Card className="dashboard-card" title="Prihod od karata">
          <p className="dashboard-value text-blue">{`${data.totals.totalTicketRevenue.toFixed(2)} RSD`}</p>
        </Card>
        <Card className="dashboard-card" title="Prihod od resursa">
          <p className="dashboard-value text-purple">{`${data.totals.totalResourceRevenue.toFixed(2)} RSD`}</p>
        </Card>
        <Card className="dashboard-card" title="Prodate karte">
          <p className="dashboard-value text-orange">{data.totals.totalTicketsSold}</p>
        </Card>
      </div>

      <div className="dashboard-charts">
        <Card className="dashboard-card chart-card" title="Prihod po mesecima">
          <Chart type="line" data={revenueByMonthData} options={chartOptions} />
        </Card>
        <Card className="dashboard-card chart-card" title="Top događaji po prihodu">
          <Chart type="bar" data={topEventsRevenueData} options={chartOptions} />
        </Card>
        <Card className="dashboard-card chart-card" title="Najpopularnije karte">
          <div className="pie-chart-container">
            <Chart type="pie" data={topTicketsData} options={pieChartOptions} />
            {renderLegend(topTicketsData)}
          </div>
        </Card>
        <Card className="dashboard-card chart-card" title="Najtraženiji resursi">
          <div className="pie-chart-container">
            <Chart type="doughnut" data={topResourcesData} options={pieChartOptions} />
            {renderLegend(topResourcesData)}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
