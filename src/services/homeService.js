'use strict';

const request = require('request');

const relayCommand = (req, res) => {

    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ?
        req.body.result.parameters.echoText :
        'No imput text given.';
    // var speech = req.body.speech;
    console.log('speech =', speech);
    const URL = `https://commandapi.herokuapp.com/conhome/service/givecommand?GatewayId=1234&Command=${speech}`;

    const callback = (err, response, body) => {
        if (err) {
            return res.json({
                speech: 'Unexpected error connecting to webservice',
                displayText: 'Unexpected error connecting to webservice',
                source: 'connected home webservice'
            });
        } else if (response.statusCode === 200) {
            return res.json({
                speech: JSON.parse(body).message,
                displayText: JSON.parse(body).message,
                source: 'connected home webservice'
            });
        }
        return res.json({
            speech: JSON.parse(body).message,
            displayText: JSON.parse(body).message,
            source: 'connected home webservice'
        });
    };

    request.get(URL, callback);

    // end of relayCommand
};

module.exports.relayCommand = relayCommand;
