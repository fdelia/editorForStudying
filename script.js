
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
	let registers = JSON.parse(localStorage.getItem('registers') || "{}");

	// Get words without old words
	let wordsOld = wordsFromRegisters(registers);
	let wordsAll = getWordsFromHtml($('.content').val());
	
	console.log(wordsAll)
	console.log(wordsOld)
	let words = wordsAll.filter(x => !wordsOld.includes(x));
	console.log(words)


	// Register new word/lines -> save them with stats
	// Timestamp, number of pauses, histogram, new words
	let timeStamp = new Date().toISOString();
	registers[timeStamp] = {
		pauses: pauses,
		words: words
	}
	console.log(registers)
	localStorage.setItem('registers', JSON.stringify(registers))
}

function wordsFromRegisters(registers){
	return Object.values(registers).map(x => x['words']).flat();
}

function getWordsFromHtml(html){
	let lines = html.split('</div><div>')

	let words = lines.map(line => {
		let prePart = line.split(':')[0]
		let prePartText = stripHtml(prePart).trim()
		return prePartText.split(' ');
	})
	.filter(word => word.length > 3)
	.filter(word => word !== "");
	return words.flat();
}

function stripHtml(html){
    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

$(function(){

	$('.content').richText();

	$('.richText-editor').on('keyup', function(e){
		//console.log(e.which)

		if (e.which === 32 || e.which === 13) // SPACE or ENTER
			pauseStats();
	});

	let int = setInterval(function(){
		if (checkIfIntervalFinished())
			registerWords();
	}, 1000);
});