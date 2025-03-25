"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
// services/oneSignalService.ts
const node_onesignal_1 = require("@onesignal/node-onesignal");
const appKeyProvider = {
    getToken: () => process.env.ONE_SIGNAL_API_KEY || '',
};
const configuration = (0, node_onesignal_1.createConfiguration)({
    authMethods: {
        rest_api_key: {
            tokenProvider: appKeyProvider,
        },
    },
});
const oneSignalClient = new node_onesignal_1.DefaultApi(configuration);
const sendNotification = async (message) => {
    if (!process.env.ONE_SIGNAL_APP_ID) {
        throw new Error('app id is not defined');
    }
    const notification = {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['Subscribed Users'],
    };
    try {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Notification sent:', response);
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
};
exports.sendNotification = sendNotification;
