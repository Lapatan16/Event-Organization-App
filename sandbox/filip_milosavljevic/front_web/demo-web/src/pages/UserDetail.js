import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        API.get(`/${id}`).then(res => setUser(res.data));
    }, [id]);

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <Link to={`/edit/${user.id}`}>Edit</Link>
            {' | '}
            <Link to="/">Back</Link>
        </div>
    );
}
