'use strict';

const request = require('request');

const relayCommand = (req, res) => {
    // Initially we don't have any access
    var passAccess = global.access;
    var uid = global.uid;
    var dob = global.dob;
    /*console.log('passkey = ', passAccess);
    console.log('uid = ', uid);
    console.log('dob = ', dob);
   old service =  https://desolate-chamber-64855.herokuapp.com/services/cservice
    console.log('req = ', req.body.result.parameters);
    console.log('access = ', global.access); */
    // Few initial checks
    if (passAccess === 'granted' && req.body.result.parameters.passKey) {
        return res.json({
            speech: 'You are already logged in , by any chance do you want to log out ?',
            displayText: 'You are already logged in , by any chance do you want to log out ?',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'granted' && req.body.result.parameters.logOut) {
        global.access = 'not granted';
        global.uid = '';
        global.dob = '';

        return res.json({
            speech: 'You have been successfully logged out of your home service, all access rights have been revoked',
            displayText: 'You have been successfully logged out of your home service, all access rights have been revoked',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'not granted' && req.body.result.parameters.logOut) {
        return res.json({
            speech: 'You are already logged out from your home service',
            displayText: 'You are already logged out from your home service',
            source: 'chat bot relay service'
        });
    } else if (passAccess === 'not granted') {
        const key = req.body.result && req.body.result.parameters && req.body.result.parameters.passKey ?
            req.body.result.parameters.passKey :
            'No access';

        console.log(key);
        if (key === 'No access') {
            return res.json({
                speech: 'Now I only need your passphrase to give you access.',
                displayText: 'Now I only need your passphrase to give you access.',
                source: 'chat bot relay service'
            });
        } else if (key === 'password') {
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
            const URL = `https://tcs-chatbot-service.herokuapp.com/services/passphrase?passKey=${passString}`;
            request.get(URL, callback);
        }
        // end of main if
        // ACCESS GRANTED BLOCK
    } else if (passAccess === 'granted') {
        let URL;
        let key;
        
        console.log(req.body.result.parameters);
        
        if ( req.body.result && req.body.result.parameters && req.body.result.parameters.billKey) {
              key =  req.body.result.parameters.billKey ;
        } else if (req.body.result && req.body.result.parameters && req.body.result.parameters.thermostatKey) {
              key = req.body.result.parameters.thermostatKey;
        }else if (req.body.result && req.body.result.parameters && req.body.result.parameters.cameraKey) {
            key = req.body.result.parameters.cameraKey;
      }else if (req.body.result && req.body.result.parameters && req.body.result.parameters.hueKey) {
        key = req.body.result.parameters.hueKey;
     } else {
             key = 'No valid key';
         }

        if (key === 'bill' && req.body.result.parameters.billInvoke) {
            console.log('inside bill invoke');
            URL = `https://tcs-chatbot-service.herokuapp.com/services/askbill?UID=${uid}&DOB=${dob}`;
        
        } else if (key === 'bill' && req.body.result.parameters.billPay) {
            console.log('inside bill pay');
            URL = `https://tcs-chatbot-service.herokuapp.com/services/paybill?UID=${uid}&DOB=${dob}`;
        
        } else if (key === 'thermostat' && req.body.result.parameters.switchThermostat) {
            console.log('inside thermostat switch service'); 
            let value = req.body.result.parameters.switchThermostat;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/tservice?control=switch&key=${value}`;
       
        } else if (key === 'thermostat' && req.body.result.parameters.thermoStatFan) {
            console.log('inside thermostat fan service'); 
            let value = req.body.result.parameters.thermoStatFan;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/tservice?control=fan&key=${value}`;
        
        } else if (key === 'thermostat' && req.body.result.parameters.thermostatTemp) {
            console.log('inside thermostat temp service'); 
            URL = `https://tcs-chatbot-service.herokuapp.com/services/tservice?control=temp`;
        
        } else if (key === 'thermostat' && req.body.result.parameters.thermostatSetpoint) {
            console.log('inside thermostat setPoint service'); 
            let value = req.body.result.parameters.thermostatSetpoint;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/tservice?control=setpoint&key=${value}`;
        
        } else if ((key === 'camera1' || key === 'camera2') && req.body.result.parameters.cameraAudio) {
            console.log('inside camera audio service'); 
            let value = req.body.result.parameters.cameraAudio;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/cservice?camera=${key}&control=audio&key=${value}`;
        
        } else if ((key === 'camera1' || key === 'camera2') && req.body.result.parameters.cameraMotion) {
            console.log('inside camera motion service'); 
            let value = req.body.result.parameters.cameraMotion;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/cservice?camera=${key}&control=motion&key=${value}`;
        
        } else if ((key === 'camera1' || key === 'camera2') && req.body.result.parameters.cameraNightMode) {
            console.log('inside camera night mode service'); 
            let value = req.body.result.parameters.cameraNightMode;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/cservice?camera=${key}&control=nightmode&key=${value}`;
        
        } else if ((key === 'camera1' || key === 'camera2') && req.body.result.parameters.cameraLed) {
            console.log('inside camera Led service'); 
            let value = req.body.result.parameters.cameraLed;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/cservice?camera=${key}&control=led&key=${value}`;
        
        } else if (key === 'hue'  && req.body.result.parameters.hueLights) {
            console.log('inside hue light service'); 
            let value = req.body.result.parameters.hueLights;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/hservice?control=lights&key=${value}`;
        
        } else if (key === 'hue'  && req.body.result.parameters.hueBrightness) {
            console.log('inside hue brightness service'); 
            let value = req.body.result.parameters.hueBrightness;
            URL = `https://tcs-chatbot-service.herokuapp.com/services/hservice?control=brightness&key=${value}`;
        
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
