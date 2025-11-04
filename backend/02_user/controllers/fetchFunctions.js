// controllers/fetchFunctions.js

export async function fetchAbortMatch(user) {
    const res = await fetch('http://match-service:3000/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            user_id: user.id,
        })
    });
    if (!res.ok)
        return (res);
    return (await res.json());
}