

function askOxford (word_id)
{
	var request = require('request-promise');
				
	var app_id = process.env.OXFORD_APP_ID;	//'b93e7377'
	var app_key = process.env.OXFORD_APP_KEY; //'5d7ed5aacc033b4775b950e3e2438058'
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
				
				//<speak> There are<emphasis>4 </emphasis><break/> definitions.<emphasis>First </emphasis><break strength="x-strong"/> is this </speak> 
				if (count > 1){
					str =  "<speak><prosody rate='slow'>There are <emphasis>" + count + "</emphasis><break/> definitions of the word " + output.results[0].id + "<break time='1s'/>";

					for (counter = 0; counter < count; counter++)
					{ 
						if (counter < nums.length)	
							str = str + " The <emphasis>" + nums[counter] + "</emphasis><break/> is " + output.results[0].lexicalEntries[0].entries[0].senses[counter].definitions[0] + "<break time='1s'/>"; 
						else
							str = str + " The <emphasis>next</emphasis><break/> is " + output.results[0].lexicalEntries[0].entries[0].senses[counter].definitions[0] + "<break time='1s'/>";		
					}

				}
				else if (count == 1){
					str = "<speak><prosody rate='medium'>There is <emphasis>" + count + "</emphasis><break/> definition of the word " + output.results[0].id + "<break time='1s'/>";
					str = str + " The definition is <break/>" + output.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] + "<break time='1s'/>";
				}
				else{
					str = "<speak><prosody rate='medium'>No definition found or word not understood";
				}
	
				if(count > 1)	
				{			
				}
				str = str + "</prosody></speak>";
				
				callback(sessionAttributes, {
						'outputSpeech':
						{
							'type': 'SSML',
							//'text': "<speak>" + gadget + " is " + output.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] + ".</speak>",
							'ssml': str,
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
