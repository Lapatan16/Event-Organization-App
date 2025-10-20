import { Button } from "primereact/button";

import './ListaUlaznica.css'

type ListItemProps = 
{
    id: string;
  name: string;
  quantity: number;
  price: number;
  time: number;
}

type ListProps  =
{
    ticket: ListItemProps[]
}

const ListaUlaznica = ({ticket}: ListProps) =>
{
    return (
        <div className="lista-ulaznica">
            {ticket.map((ticket, index) => (
                <div key={index} className="item">
                    <div className="left">
                        <div>
                            <p>Naziv: {ticket.name}</p>
                        </div>
                        <div>
                            <p>Cena: {ticket.price} RSD</p>
                        </div>
                    </div>

                    <div className="right">
                        <Button className="kupi-kartu-btn" type="button">Kupi kartu</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ListaUlaznica;