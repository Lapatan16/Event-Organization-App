import './TabViewMenu.css'

import { TabView, TabPanel } from 'primereact/tabview';
import EventCard from './EventCard';

 const TabViewMenu = () => {
    return (
        <div className='tabview'>
            <TabView >
                <TabPanel header="Izveštaj">
                      <h2>Izveštaj o prodaji</h2>

                    <div className="card-grid">
                        <EventCard title="Bruto prodaje" />
                        <EventCard title="Neto prodaje" />
                        <EventCard title="Dekompozicija neto prodaje" />
                        <EventCard title="Prodato ulaznica" />
                    </div>
                </TabPanel>
                <TabPanel header="Trendovi">
                    
                </TabPanel>
                
            </TabView>
            </div>

    )
}
        export default TabViewMenu