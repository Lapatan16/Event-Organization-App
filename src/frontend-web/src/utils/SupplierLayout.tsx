import { TabMenu } from 'primereact/tabmenu';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const SupplierLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    // { label: 'Kontrolna tabla', icon: 'pi pi-home', path: '/supplier/dashboard' },
    { label: 'Narudžibe', icon: 'pi pi-inbox', path: '/supplier/orders' },
    { label: 'Proizvodi', icon: 'pi pi-box', path: '/supplier/resources' },
  ];

  const activeIndex = tabs.findIndex(tab => location.pathname.startsWith(tab.path));

  return (
    <div>
      <TabMenu
      style={{ color: "#0353a4" }}
        model={tabs}
        activeIndex={activeIndex}
        onTabChange={(e) => navigate(tabs[e.index].path)}
        
      />
      <div className='dashboard-content-div'>
        <Outlet />
      </div>
    </div>
  );
};

export default SupplierLayout;
