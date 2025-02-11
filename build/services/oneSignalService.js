"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const sendNotification = (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.ONE_SIGNAL_APP_ID) {
        throw new Error('app id is not defined');
    }
    const notification = {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['Subscribed Users'],
    };
    try {
        const response = yield oneSignalClient.createNotification(notification);
        console.log('Notification sent:', response);
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
});
exports.sendNotification = sendNotification;
