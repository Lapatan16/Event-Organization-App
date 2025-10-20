import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/UserContext';

type NavbarProfileProps = 
{
  // name: string | undefined;
  profileImageUrl: string | null;
}

const NavbarProfile = ({profileImageUrl}: NavbarProfileProps) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleClick = () => {
    navigate('/profil');
  };

  if (!user) return null;

  return (
    <div onClick={handleClick} style={styles.container}>
      {profileImageUrl ? (
        <img src={profileImageUrl} alt="Avatar" style={styles.avatarImg} />
      ) : (
        <div style={styles.avatarFallback}>{user.firstName[0].toUpperCase()}</div>
      )}
      <span style={styles.username}>{user.firstName}</span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '10px',
    color: 'white',
  },
  avatarImg: {
  flex: '0 0 35px',
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  border: '2px solid #0353a4',
  objectFit: 'cover',
  marginRight: '10px',
},

avatarFallback: {
  flex: '0 0 35px',
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  border: '2px solid #0353a4',
  backgroundColor: '#d2d2d2ff',
  color: '#0353a4',
  fontWeight: 700,
  fontSize: '1.15rem', // ~20px
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '10px',
},

  username: {
    fontSize: '16px',
    fontWeight: 500,
  },
};

export default NavbarProfile;
