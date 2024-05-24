import axios from 'axios';
import express from "express";

import { SHIPPO_SECRET_KEY, SHIPPO_CLIENT_ID, SHIPPO_OAUTH_REDIRECT_URI } from '../config';

const router = express.Router();

const connectShippo = async (accId) => { };

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

export { connectShippo };
export default router;
