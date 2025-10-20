import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

export default function UserForm({ edit }) {
    const [user, setUser] = useState({ name: '', email: '', role: '' });
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (edit && id) {
            API.get(`/${id}`).then(res => setUser(res.data));
        }
    }, [edit, id]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (edit) {
            await API.put('', { ...user, id });
        } else {
            await API.post('', user);
        }
        navigate('/');
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>{edit ? 'Edit User' : 'Create New User'}</h2>
            <div>
                <label>Name:</label><br />
                <input value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
            </div>
            <div>
                <label>Email:</label><br />
                <input value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
            </div>
            <div>
                <label>Role:</label><br />
                <input value={user.role} onChange={e => setUser({ ...user, role: e.target.value })} required />
            </div>
            <br />
            <button type="submit">{edit ? 'Update' : 'Create'}</button>
        </form>
    );
}
