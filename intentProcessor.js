

	function askOxford (word_id)
	{
		var request = require('request-promise');
				
		var app_id = 'b93e7377'
		var app_key = '5d7ed5aacc033b4775b950e3e2438058'
		var oxfordURL = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/" + word_id + "/definitions";
		var hdr = {"Accept":"application/json", "app_id": app_id, "app_key": app_key }; // request headers 

  		var output = "Querying the Oxford dictionary";
								
		console.log ("Trying Oxford API now");
		
		
    	return request({
      	"method":"GET", 
      	"uri": oxfordURL,
      	"json": true,
      	"headers": hdr
    	});		
		
			
		
    	
    		   		 
    		// raw response 
    		//console.log(response);
	}



module.exports =
{


	
	processIntent: function (intent, callback)
	{
		var intent_name = intent.name;
		var gadget = "Gadget";
		
		if (intent_name === 'AMAZON.HelpIntent')
		{
			console.log ('User Asking for Help');
			var sessionAttributes ={};
			callback
			(
				sessionAttributes, 
				this.buildSpeechletResponse
				(
					"Oxford dictionary title",
					"Welcome to oxford dictionary. Ask me meaning of any word.", 
               "What would you ask about?", false)
			);
		}
		else if (intent_name === 'AMAZON.StopIntent' || intent_name === 'AMAZON.CancelIntent') 
		{
			console.log ('User asking to stop');
			var sessionAttributes ={};
			callback
			(
				sessionAttributes, 
				this.buildSpeechletResponse
				(
					"Oxford dictionary title",
					"Hello user, Thank you for using Oxford dictionary" ,
					"", true)
			);			
		}



		else if (intent_name === 'OxfordIntent')
		{
			gadget = intent.slots.Word.value.toLowerCase();
			//var value = intent.slots.amount.value;

			var sessionAttributes ={};
					
			console.log ('Recd oxford dictionary Intent');
			//console.log (gadget)
			
			//gadget = "test_gadget";
			
			askOxford(gadget).then(function(output) 
			{
				console.log ("Next in the chain being executed");
				console.log(output);
				
				
				var nums = [ "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
	
				count = (output.results[0].lexicalEntries[0].entries[0].senses).length;
				
				var str = "";
				
				if (count > 1)
					str = "There are " + count + " definitions of the word " + output.results[0].id + "<break strength = 'strong'>";
				else if (count == 1)
					str = "There is " + count + " definitions of the word " + output.results[0].id;
				else
					str = "No definition found or word not understood";
	
				for (counter = 0; counter < count; counter++)
				{ 
					if (counter < nums.length)	
						str = str + " The " + nums[counter] + " is " + output.results[0].lexicalEntries[0].entries[0].senses[counter].definitions[0] + "\n"; 
					else
						str = str + " The next is " + output.results[0].lexicalEntries[0].entries[0].senses[counter].definitions[0] + "\n";		
				}


				callback(sessionAttributes, {
						'outputSpeech':
						{
							'type': 'PlainText',
							'text': gadget + " is " + output.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0],
							'text': str,
						},

						'reprompt':{'outputSpeech':{'type': 'PlainText','text': "reprompt"}},
						'shouldEndSession': true
				});				
				
				
			});				
		}


		else
		{
			console.log ("Recd invalid intent");
		}
				
	},
	

	
	sendPNCommand: function  (message, callback)
	{
		var PN = require("pubnub");
		var pn = new PN
		({
			ssl           : true,  // <- enable TLS Tunneling over TCP
			publish_key   : process.env.PUB_NUB_PUBLISH_KEY,
			subscribe_key : process.env.PUB_NUB_SUBSCRIBE_KEY
		});
		
		var output = message['message'];
		console.log ("Trying to send message");
		console.log ("Channel is: ", process.env.PUB_NUB_CHANNEL_KEY);
		pn.publish(
			{
				channel   : process.env.PUB_NUB_CHANNEL_KEY,
				message   : message
			},
			
			function (status, response)
			{
				console.log ("Callback fired");
				if (status.error)
				{
					console.log("Failed publish", status, response);
				}
				else
				{
					console.log("Succeedded publish", status, response);
				}
			}
		);
		console.log ("Sent messge, exepcted callback");
		//var speechletResponse = this.buildSpeechletResponse("My Home Title", output, "What else you want to do?", false);
		var sessionAttributes = {};
		//var resp = this.buildResponse(sessionAttributes, speechletResponse);
		console.log ("Finally calling back");
		//callback(null, resp);
		callback
		(
			sessionAttributes,
			this.buildSpeechletResponse("My Home Title", output, "What else you want to do?", true)
		);
	},
	
	
	buildSpeechletResponse: function(title, output, repromptText, shouldEndSession)
	{
		console.log ("Building speechlet response");
		return(
		{
			'outputSpeech':
			{
				'type': 'PlainText',
				'text': output,
			},
			/*
			card:
			{
                'type': 'Simple',
                'title': title,
                content: output
            },
            */ 
			'reprompt':
			{
				'outputSpeech':
				{
					'type': 'PlainText',
					'text': repromptText
				}
			},
			'shouldEndSession': shouldEndSession
		});
	},

	buildResponse: function(sessionAttributes, speechletResponse)
	{
		console.log ("Building final response");
		console.log (speechletResponse);
		return {
			'version': '1.0',
			'sessionAttributes': sessionAttributes,
			'response': speechletResponse
		};
	},		

	
} // end main 
