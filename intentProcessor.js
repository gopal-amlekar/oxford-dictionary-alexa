

function askOxford (word_id)
{
	var request = require('request-promise');
				
	var app_id = process.env.OXFORD_APP_ID;	// Get this from the Oxford dictionary API webpage
	var app_key = process.env.OXFORD_APP_KEY; // Get this from the Oxford dictionary API webpage
	var oxfordURL = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/" + word_id;// + "/definitions";
	var hdr = {"Accept":"application/json", "app_id": app_id, "app_key": app_key };
						
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
		var word_id = "DummyWord";
		
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
			word_id = intent.slots.Word.value.toLowerCase();

			var sessionAttributes ={};
					
			console.log ('Recd oxford dictionary Intent');
			//console.log (word_id)
			
			askOxford(word_id).then(function(output) 
			{
				console.log ("Next in the chain being executed");
				console.log(output);
				
				count = (output.results[0].lexicalEntries[0].entries[0].senses).length;
				
				var str = "";
				
				if (count > 1){
					str =  "<speak><prosody rate='slow'>There are <emphasis>" + count + "</emphasis><break/> definitions of the word " + output.results[0].id + "<break time='1s'/>";

					for (counter = 0; counter < count; counter++)
					{ 
						str = str + " The <emphasis>" + counter + "</emphasis><break/> is " + output.results[0].lexicalEntries[0].entries[0].senses[counter].definitions[0] + "<break time='1s'/>"; 

						if (output.results[0].lexicalEntries[0].entries[0].senses[counter].hasOwnProperty('examples'))
						{
							str = str + "<emphasis>Example</emphasis><break/>" + output.results[0].lexicalEntries[0].entries[0].senses[counter].examples[0].text + "<break time='1s'/>";
						}
						else
						{
							str = str + "Example not available for this definition  <break time='1s'/>";
						}
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
							//'text': "<speak>" + word_id + " is " + output.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0] + ".</speak>",
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
