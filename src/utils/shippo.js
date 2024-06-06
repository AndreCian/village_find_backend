import express from "express";
import { Shippo } from 'shippo';

import { SHIPPO_SECRET_KEY } from '../config';

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
        if (err.statusCode === 201) {
            const account = JSON.parse(err.body);
            return account;
        } else {
            throw err;
        }
    }
}

const createCarrierAccount = async (accountID, type) => {
    try {
        const account = await shippoClient.carrierAccounts.create({
            accountId: accountID,
            carrier: type,
            parameters: {},
            active: true
        });
        return account;
    } catch (err) {
        throw err;
    }
}

const createShipment = (from, to, parcel) => {
}

const retrieveShippoAccount = async (accountID) => {
    try {
        const account = await shippoClient.shippoAccounts.get(accountID);
        return account;
    } catch (err) {
        console.error('Failed to get managed shippo account:', err);
    }
}

export { createShippoAccount, retrieveShippoAccount, createCarrierAccount };
export default router;
