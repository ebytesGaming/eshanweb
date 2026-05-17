// Vercel Serverless Function to securely add users to Eshan's Discord Guild
// Requires BOT_TOKEN to be set in your Vercel Environment Variables.
// Scope needed: guilds.join authorized in OAuth URL.

export default async function handler(req, res) {
    // Enable CORS for static client requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { access_token, user_id } = req.body;
    if (!access_token || !user_id) {
        return res.status(400).json({ error: 'Missing access_token or user_id' });
    }

    const SERVER_GUILD_ID = '1505412638371483828';
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
        return res.status(500).json({ error: 'BOT_TOKEN is not configured on the server environment' });
    }

    try {
        const discordRes = await fetch(`https://discord.com/api/v10/guilds/${SERVER_GUILD_ID}/members/${user_id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token: access_token
            })
        });

        if (discordRes.status === 201) {
            return res.status(200).json({ success: true, joined: true, message: 'Successfully joined the guild!' });
        } else if (discordRes.status === 204) {
            return res.status(200).json({ success: true, joined: false, message: 'User is already a member of the guild.' });
        } else {
            const errData = await discordRes.json();
            return res.status(discordRes.status).json({ error: 'Discord API Error', details: errData });
        }
    } catch (err) {
        console.error('Join Error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}
