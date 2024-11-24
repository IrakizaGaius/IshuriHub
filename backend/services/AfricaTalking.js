require('dotenv').config(); 
const africastalking = require('africastalking');

const { AFRICATALKING_API_KEY, AFRICATALKING_USERNAME} = process.env;

if (!AFRICATALKING_API_KEY || !AFRICATALKING_USERNAME) {
    throw new Error('Africa\'s Talking credentials are not set in the environment variables');
}

const at = africastalking({
    apiKey: AFRICATALKING_API_KEY,
    username: AFRICATALKING_USERNAME,
});

const sms = at.SMS;

const sendSMS = async (to, message) => {
    try {
        const options = {
            to: Array.isArray(to) ? to : [to],
            message: message,
            bulkSMSMode: 1, 
            from: 'AFRICASTKNG',
        };

        const response = await sms.send(options);
        console.log('SMS Response:', response);
        return response;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        throw new Error(`Failed to send SMS: ${error.message}`);
    }
};

module.exports = {
    sendSMS,
};
