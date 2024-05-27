import axios from 'axios';
import express from "express";
import { Shippo } from 'shippo';

import { SHIPPO_SECRET_KEY, SHIPPO_CLIENT_ID, SHIPPO_OAUTH_REDIRECT_URI } from '../config';

const router = express.Router();
const shippoClient = new Shippo({ apiKeyHeader: SHIPPO_SECRET_KEY });

const createShippoAccount = async ({ name = '', email = '', address = '', companyName = '' }) => {
    try {
        const names = name.split(' ');
        const accountData = {
            firstName: names[0] || '',
            lastName: names[1] || '',
            email: email,
            companyName
        };
        const account = await shippoClient.shippoAccounts.create(accountData);
        return account;
    } catch (err) {
        console.error('Failed to create managed shippo account:', err);
    }
}

const retrieveShippoAccount = async (accountID) => {
    try {
        const account = await shippoClient.shippoAccounts.get(accountID);
        return account;
    } catch (err) {
        console.error('Failed to create managed shippo account:', err);
    }
}

router.get('/create-access-token', async (req, res) => {
    const authorizationCode = req.query.code;

    const response = await axios.post('https://goshippo.com/oauth/token', {
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_id: SHIPPO_CLIENT_ID,
        client_secret: SHIPPO_SECRET_KEY,
        redirect_uri: SHIPPO_OAUTH_REDIRECT_URI,
    });

    res.send({ token: response.data.data.access_token });
});

export { createShippoAccount, retrieveShippoAccount };
export default router;
