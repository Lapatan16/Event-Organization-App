import { API_URL } from "../services/config";

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userId = localStorage.getItem('userId');

    const authHeaders = new Headers(init?.headers);
    authHeaders.set('Authorization', `Bearer ${accessToken}`);

    let response = await fetch(input, {
        ...init,
        headers: authHeaders,
    });

    if (response.status === 401 && refreshToken && userId) {
        const refreshResponse = await fetch(`${API_URL}/api/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken, userId }),
        });

        if (!refreshResponse.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            return response;
        }

        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        accessToken = data.accessToken;

        authHeaders.set('Authorization', `Bearer ${accessToken}`);

        response = await fetch(input, {
            ...init,
            headers: authHeaders,
        });
    }

    return response;
}
