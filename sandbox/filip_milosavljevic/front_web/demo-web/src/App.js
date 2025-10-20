import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import UsersList from './pages/UsersList';
import UserForm from './pages/UserForm';
import UserDetail from './pages/UserDetail';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <nav style={{ marginBottom: 20 }}>
          <NavLink to="/" style={{ marginRight: 10 }}>Users</NavLink>
          <NavLink to="/new">Add User</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<UsersList />} />
          <Route path="/new" element={<UserForm />} />
          <Route path="/edit/:id" element={<UserForm edit />} />
          <Route path="/user/:id" element={<UserDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
