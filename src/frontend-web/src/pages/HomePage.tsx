import { Link } from 'react-router-dom';
import './HomePage.css'; 
import homeImage from '../assets/home.jpeg';



const Home = () => {
  return (
    <div className='homepage'>
      <div className="home-container">
        <div className="hero-section">
          <div className='hero-section-left'>
            <div>
              <h1>Veliki događaji zahtevaju veliku organizaciju</h1>
              
              <div className='home-buttons'>
                <Link className="new-event" to="/login">NOVI DOGAĐAJ</Link>
                <Link className="new-event" to="/register">REGISTRUJ SE</Link>
              </div>
            </div>
          </div>
          <div className='hero-section-right'>
            <p>Događarko biće tvoj asistent</p>
            <div className='hero-section-gallery'> 
              <img src={homeImage} alt="Image 1" className="gallery-img"></img>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
