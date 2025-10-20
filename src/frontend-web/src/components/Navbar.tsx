import { Link, useNavigate } from 'react-router-dom';
import NavbarProfile from './NavbarProfile';
import { useUser } from '../hooks/UserContext';
import './Navbar.css';

const Navbar = () => {
    let meni;
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        setUser(null);
        navigate('/login');
    };

    if (!user) {
        meni = (
            <nav className="navbar">
                <div className='navbar-left'>
                    <h2 className="logo"><Link className='navbar-link' to={'/home'}>Događarko</Link></h2>
                </div>

                <div className='navbar-right'>
                    <div className='navbar-link-div'><Link className='navbar-link' to='/login'>Prijava</Link></div>
                    <div className='navbar-link-div'><Link className='navbar-link' to='/register'>Registracija</Link></div>
                </div>
            </nav>
        )
    }
    else if (user.role === 'Supplier') {
        meni = (
            <nav className="navbar">
            <div className='navbar-left'>
                <h2 className="logo"><Link className='navbar-link' to={'/supplier/orders'}>Događarko</Link></h2>
            </div>
            <div className='navbar-right'>
                <div className='navbar-link-div'><NavbarProfile profileImageUrl='' /></div>
                <div className='navbar-link-div navbar-logout'>
                <button className='navbar-link logout-button' onClick={logout}>Odjavite se</button>
                </div>
            </div>
            </nav>
        )
        }
    else {
        meni = (
            <nav className="navbar">
                <div className='navbar-left'>
                    <h2 className="logo"><Link className='navbar-link' to={'/dashboard'}>Događarko</Link></h2>
                </div>

                <div className='navbar-right'>
                    <div className='navbar-link-div'><Link className='navbar-link' to='/dogadjaji/novi-dogadjaj'>Novi Događaj</Link></div>
                    <div className='navbar-link-div'><NavbarProfile profileImageUrl='' /></div>
                    <div className='navbar-link-div navbar-logout'>
                        <button className='navbar-link logout-button' onClick={logout}>Odjavite se</button>
                    </div>
                </div>
            </nav>
        )
    }

    return <>{meni}</>;
};

export default Navbar;
