'use strict';

const request = require('request');

const relayCommand = (req, res) => {
    // Initially we don't have any access
    var passAccess = global.access;
    var uid = global.uid;
    var dob = global.dob;

    // Few initial checks
    if (passAccess === 'granted' && req.body.result.parameters.passKey) {
        return res.json({
            speech: 'You are already logged in , by any chance do you want to log out ?',
            displayText: 'You are already logged in , by any chance do you want to log out ?',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'granted' && req.body.result.parameters.fname) {
        return res.json({
            speech: `Hey ${global.fname}, thank tou for reminding me about your name, I'll keep it in mind.`,
            displayText: `Hey ${global.fname}, thank tou for reminding me about your name, I'll keep it in mind.`,
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'granted' && req.body.result.parameters.logOut) {
        global.access = 'not granted';
        global.uid = '';
        global.dob = '';
        global.fname = 'empty';

        return res.json({
            speech: 'You have been successfully logged out of your billing service, all access rights have been revoked',
            displayText: 'You have been successfully logged out of your billing service, all access rights have been revoked',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'not granted' && req.body.result.parameters.logOut) {
        global.fname = 'empty';
        return res.json({
            speech: 'You are already logged out from your billing service',
            displayText: 'You are already logged out from your billing service',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'not granted') {
        const key = req.body.result && req.body.result.parameters && req.body.result.parameters.passKey ?
            req.body.result.parameters.passKey :
            'No access';
        const fname = req.body.result && req.body.result.parameters && req.body.result.parameters.fName ?
            req.body.result.parameters.fName :
            'No access';

        console.log(key);
        if (fname === 'firstName') {
            const query = req.body.result.resolvedQuery;
            const qArr = query.split(" ");
            global.fname = qArr[qArr.length - 1];

            return res.json({
                speech: 'Thank you for telling me your name, now I only need your passphrase to give you access.',
                displayText: 'Thank you for telling me your name, now I only need your passphrase to give you access.',
                source: 'chat bot relay service'
            });

        } else if (key === 'password' && fname !== 'empty') {
            const callback = (err, response, body) => {
                if (err) {
                    return res.json({
                        speech: 'Unexpected error connecting to webservice',
                        displayText: 'Unexpected error connecting to webservice',
                        source: 'chat bot webservice'
                    });
                } else if (response.statusCode === 200) {
                    // set access
                    const respBody = JSON.parse(body);
                    global.access = respBody.access;
                    global.uid = respBody.uid;
                    global.dob = respBody.dob;
                    return res.json({
                        speech: respBody.message,
                        displayText: respBody.message,
                        source: 'chat bot webservice'
                    });
                } else if (response.statusCode === 400) {
                    const respBody = JSON.parse(body);
                    global.access = respBody.access;
                    return res.json({
                        speech: respBody.message,
                        displayText: respBody.message,
                        source: 'chat bot webservice'
                    });
                }
                // end of callback
            };
            const query = req.body.result.resolvedQuery;
            const qArr = query.split(" ");
            const passString = qArr[qArr.length - 1];
            const URL = `https://tcs-chatbot-service.herokuapp.com/services/passphrase?passKey=${passString}&fname=${global.fname}`;
            request.get(URL, callback);
        } else if (key === 'No access' || fname === 'No access') {
            return res.json({
                speech: 'You have not provided a valid passphrase or name.',
                displayText: 'You have not provided a valid passphrase or name.',
                source: 'chat bot relay service'
            });
        }
        // end of main if
        // ACCESS GRANTED BLOCK
    } else if (passAccess === 'granted') {
        let URL;
        const key = req.body.result && req.body.result.parameters && req.body.result.parameters.billKey ?
            req.body.result.parameters.billKey :
            'No imput text given';

        if (key === 'bill' && req.body.result.parameters.billInvoke) {
            console.log('inside bill invoke');
            URL = `https://tcs-chatbot-service.herokuapp.com/services/askbill?UID=${uid}&DOB=${dob}`;
        } else if (key === 'bill' && req.body.result.parameters.billPay) {
            console.log('inside bill pay');
            URL = `https://tcs-chatbot-service.herokuapp.com/services/paybill?UID=${uid}&DOB=${dob}`;
        } else {
            return res.json({
                speech: 'Sorry I could not understand what you said',
                displayText: 'Sorry I could not understand what you said',
                source: 'chat bot webservice'
            });
        }
        // callback for get bill services
        const callback = (err, response, body) => {
            console.log('resp body = ', body);
            if (err) {
                return res.json({
                    speech: 'Unexpected error connecting to webservice for current command',
                    displayText: 'Unexpected error connecting to webservice for current command',
                    source: 'chat bot webservice'
                });
            }
            return res.json({
                speech: JSON.parse(body).message,
                displayText: JSON.parse(body).message,
                source: 'chat bot webservice'
            });
            // end of callback
        };
        // make the request for the billing services
        request.get(URL, callback);
    }
    // end of relay command
};
module.exports.relayCommand = relayCommand;
