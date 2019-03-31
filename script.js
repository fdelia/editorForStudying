
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
	//console.log(pauseLength)
	pauses.push(pauseLength);

	oldPause = now;
	$('#currentStats').html('Pauses: ' + pauses.length)
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

let oldWords = [];

function registerWords(){
	console.log('register words and pauses ' + new Date())
	//console.log(new Date())

	let words = getWordsFromText($('.content').val())
	console.log(words)

	// Register new word/lines -> save them with stats

	// Timestamp, number of pauses, histogram, new words


}

function getWordsFromText(text){
	let lines = text.split('</div><div>')
	//console.log(lines)

	// Strip html


	let words = lines.map(line => {
		let prePart = line.split(':')[0]
		let prePartText = stripHtml(prePart).trim()
		return prePartText;
	}).filter(line => line !== "");
	return words;
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