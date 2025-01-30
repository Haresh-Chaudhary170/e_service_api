// services/oneSignalService.ts
import {
    DefaultApi,
    createConfiguration,
    Configuration,
} from '@onesignal/node-onesignal';

const appKeyProvider = {
    getToken: () => process.env.ONE_SIGNAL_API_KEY || '',
};

const configuration: Configuration = createConfiguration({
    authMethods: {
        rest_api_key: {
            tokenProvider: appKeyProvider,
        },
    },
});

const oneSignalClient = new DefaultApi(configuration);

export const sendNotification = async (message: string) => {
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
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};
