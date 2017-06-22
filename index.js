var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var intentProc = require('./intentProcessor');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000));

/*
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response){
    //console.log (request);
    //response.send(cool());
    console.log('Recived a cool request');
    response.render('pages/myindex');
});
*/

//console.log(process.env.WEB_APP_ROUTE);
//console.log(process.env.AMAZON_APP_KEY);

app.post(process.env.WEB_APP_ROUTE, function(request, response){
    console.log (request.body);
    console.log (request.body.context);
    

    console.log('Someone POSTED a cool request');
    //console.log(request);
    console.log('POSTING BACK THE RESULTS');

    var event = request.body;
    var context = request.body.context;

    console.log('Inside alexa handler');
    console.log("Event is: ", event);
    console.log("Context is: ", context);
    console.log('Request is: ', event.request);
    try
    {
        
        if (event.session.application.applicationId !== process.env.AMAZON_APP_KEY)
        {
            //callback('Authentication failure');
            console.log ('Not authenticated request');
            response.send('Authentication failure');
        }

        if (event.session.new)
        {
            console.log('SESSION ',  event.session, ' started with request ID: ',  event.request.requestId);
        }
        if (event.request.type === 'LaunchRequest')
        {
            var sessionAttributes = {};
            console.log ('Launch request');
            var speechletResponse = intentProc.buildSpeechletResponse
            ("My Home Title", 
            "Welcome to my home, please tell me turn on or off some gadget ", 
            "What would you like to do?", 
            false);
            ///callback (null, intentProc.buildResponse (sessionAttributes, speechletResponse));
            response.send(intentProc.buildResponse (sessionAttributes, speechletResponse));
            console.log("Launch request recd");
        }

        else if (event.request.type === 'IntentRequest') 
        {
            intentProc.processIntent
            (
                event.request.intent,
                function(sessionAttributes, speechletResponse)
                {
                  console.log ('Final callback');
                  ///callback(null, intentProc.buildResponse (sessionAttributes, speechletResponse));

                  response.send(intentProc.buildResponse (sessionAttributes, speechletResponse));
                  //var restosend = intentProc.buildResponse (sessionAttributes, speechletResponse);
                  //console.log ("Sent response: ", restosend);
                }
            );
                  
            console.log ('Done with the intents');
            
        } // end all intent requests
        else if (event.request.type === 'SessionEndedRequest')
        {
            console.log ('Session end');
        }

    } // End Try block
    catch (err)
    {
        response.send(err);
    }

    console.log ('POST job done');

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});