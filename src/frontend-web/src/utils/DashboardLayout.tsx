import { TabMenu } from 'primereact/tabmenu';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import "./TabMenu.css"
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();  

  const tabs = [
   { label: 'Kontrolna Tabla', icon: 'pi pi-chart-bar', path: '/dashboard' },
    { label: 'Događaji', icon: 'pi pi-flag', path: '/dogadjaji' },
    { label: 'Dobavljači', icon: 'pi pi-warehouse', path: '/dobavljaci' }
  ];

  const activeIndex = tabs.findIndex(tab => location.pathname.startsWith(tab.path.replace('/*', '')));

  return (
    <div>
      <TabMenu
     
        model={tabs.map(({ label, icon }) => ({ label, icon }))}
        activeIndex={activeIndex}
        onTabChange={(e) => navigate(tabs[e.index].path)}
        className='dashboard-menu'
      />
      <div className='dashboard-content-div'>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
