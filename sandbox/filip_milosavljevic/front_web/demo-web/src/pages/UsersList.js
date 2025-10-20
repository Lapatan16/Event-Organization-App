import { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

export default function UsersList() {
    const [users, setUsers] = useState([]);

    async function load() {
        const res = await API.get('/');
        setUsers(res.data);
    }

    useEffect(() => {
        load();
    }, []);

    async function remove(id) {
        if (window.confirm("Delete this user?")) {
            await API.delete(`/${id}`);
            load();
        }
    }

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map(u => (
                    <li key={u.id}>
                        <Link to={`/user/${u.id}`}>{u.name}</Link> — {u.email} — {u.role}
                        {' | '}
                        <Link to={`/edit/${u.id}`}>Edit</Link>
                        {' | '}
                        <button onClick={() => remove(u.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
