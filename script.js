
let oldPause = null;
let pauses = [];

function pauseStats(){
	// Make stats for pauses
	if (! oldPause){
		oldPause = new Date(); 
		return;
	}

	let now = new Date();
	let pauseLength = now - oldPause;

	pauses.push(pauseLength);
	oldPause = now;

	// Debug
	$('#currentStats').html('Pauses: ' + pauses.length)
	$('#statsSoFar').html(pauses.join(' ') + ' ms')
}

let lastRegistration = null;
const intervalMinutes = 1; // only works if 60 % interval == 0 at the moment

function checkIfIntervalFinished(){
	// If interval is finished
	let now = new Date();
	let minutesNow = now.getMinutes();
	if (minutesNow % intervalMinutes !== 0) return false;

	if (! lastRegistration){
		lastRegistration = now;
		return true;
	} else {
		// Check if interval is finished
		let lastRegistrationMinutes = lastRegistration.getMinutes();
		if (lastRegistrationMinutes + intervalMinutes <= minutesNow){
			lastRegistration = now;
			return true;
		}
	}

	return false;
}

function registerWords(){
	console.log('register words and pauses ' + new Date())

	// Previous "registers"/data
	let registers = Helpers.getFromStorage('registers');

	// Get words without old words
	let wordsOld = Helpers.wordsFromRegisters(registers);
	let wordsAll = Helpers.getWordsFromHtml($('.content').val());
	
	//console.log(wordsAll)
	//console.log(wordsOld)
	let words = wordsAll.filter(x => !wordsOld.includes(x));
	console.log(words)

	// Don't register if there is nothing to save
	if (pauses.length === 0 || words.length === 0) return;

	// Register new word/lines -> save them with stats
	// Timestamp, number of pauses, histogram, new words
	let timeStamp = new Date().toISOString();
	registers[timeStamp] = {
		pauses: pauses,
		words: words
	}
	console.log(registers)
	localStorage.setItem('registers', JSON.stringify(registers))
	pauses = []
}

function showData(){
	let registers = Helpers.getFromStorage('registers');
	let text = '';
	for (timeStamp of Object.keys(registers)){
		let value = registers[timeStamp];
		//text += `${timeStamp}\t${value.pauses.join(' ')}\t${value.words.join(' ')}\n`;
		text += `${timeStamp}\t0.0\n`;
	}
	$('#dataArea').val(text);
	$('#wordRememberInput').val(text); // <- for the moment
	$('#dataArea').show().focus().select();
	setTimeout(function(){
		$('#dataArea').hide()
	}, 10 * 1000)
}

function saveWordRememberData(){
	let saveWordRememberData = $('#wordRememberInput').val();

	
}

function trainNetwork(){
	// Features
	let registers = Helpers.getFromStorage('registers');
	let wordRememberInput = $('#wordRememberInput').val()
		.split('\n')
		.filter(x => x.trim().length > 0);
	console.log(wordRememberInput)

	if (Object.keys(registers).length === 0){
		$('#currentStats').html('<span style="color:red">No registers found.</span>');
		return;
	}
	if (wordRememberInput.length === 0){
		$('#currentStats').html('<span style="color:red">No word remembering input found.</span>');
		return;	
	}

}

function applyNetwork(){
	console.log('TODO')
}

// just to make them static (and abstract)
class Helpers {
	static wordsFromRegisters(registers){
		return Object
			.values(registers)
			.map(x => x['words'])
			.flat();
	}

	static getWordsFromHtml(html){
		return html
			.replace(';', '')
			.split('</div><div>')
			.map(line => {
				let prePartHtml = line.split(':')[0]
				let prePartText = Helpers.stripHtml(prePartHtml).trim()
				return prePartText.split(' ');
			})
			.filter(word => word.length > 3)
			.filter(word => word !== "")
			.flat();
	}

	static stripHtml(html){
	    // Create a new div element
	    var temporalDivElement = document.createElement("div");
	    // Set the HTML content with the providen
	    temporalDivElement.innerHTML = html;
	    // Retrieve the text property of the element (cross-browser support)
	    return temporalDivElement.textContent || temporalDivElement.innerText || "";
	}

	static getFromStorage(varName){
		return JSON.parse(localStorage.getItem(varName) || "{}");
	}
}

// Init synaptic stuff
var Neuron = synaptic.Neuron,
	Layer = synaptic.Layer,
	Network = synaptic.Network,
	Trainer = synaptic.Trainer,
	Architect = synaptic.Architect;

var inputLayer = new Layer(4);
var hiddenLayer = new Layer(6);
var outputLayer = new Layer(2);

inputLayer.project(hiddenLayer)
hiddenLayer.project(outputLayer)

var theNetwork = new Network({
	input: inputLayer,
	hiddenLayer: [hiddenLayer],
	output: outputLayer
})


$(function(){
	// Inits
	$('.content').richText();

	// Events
	$('.richText-editor').on('keyup', function(e){
		if (e.which === 32 || e.which === 13) // SPACE or ENTER
			pauseStats();
	});

	let intRegisterWords = setInterval(function(){
		if (checkIfIntervalFinished())
			registerWords();
	}, 1000);
});