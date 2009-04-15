/*
COMMENT: Most variables are initialized in their own file.
GENERAL NOTE:  I am setting cursor so that it equals selectionStart in Firefox:  one after the last-typed character.
DOCUMENTATION:  substring arguments are startAt and endBefore.
To enable console logging, add ?clog=true to the URL.
(NOTE:  Must have Firebug installed and have enabled the Console panel for this file.  You can get Firebug from http://getfirebug.com .)
*/

var gotomem = true; //Reset highlighting to memory row when word completion suggestions shown.
var UseTwoSwitchTyping = true;
var timerLength = 1000; //in milliseconds.
var SWITCH1 = 221; //close bracket advances
var SWITCH2 = 219; //open bracket selects
var SWITCH3 = 220 // \ runs through memory
 //Horray!  These are the same in Firefox and IE!
 //(Incidentally, the arrow keys are, too.)
var H_COL = "#cc6600";
var TAREA_COL = "white";
var KEY_SIZE = 40;
var TEXT_SIZE = 30;
var use_rad = false;
var precision = 4;
var SIG_FIGS = 4;
var reset = true;
var mem_lets = 4;
var prevText = ""; var cursor = 0;  //These two variables are for IE support.
var repeat = 1;  var alrepeat = repeat;  //the value it gets reset to.
var overtype = true;
var memkey = 0;
var caplock = false;
var shifted = false;  //says whether the shift key has last been pressed

var clog = false;
var digits = new Array('1','2','3','4','5','6','7','8','9','0');
var operators = new Array('+','-','*','/','=', '^', '(',')', '%', '&pi;');
var ABC = new Array(
  new Array('[&nbsp;]', 'A','B','C','D','E','F', 'G','H'),
  new Array('I','J','K','L','M', 'N','O','P','Q'),
  new Array('R','S','T','U','V','W','X','Y','Z')
);
var ETA = new Array(
  new Array('[&nbsp;]','E','A','N','R','C','W','Y','V'),
  new Array('T','O','S','D','U','F','P','K','J'),
  new Array('I','H','L','M','G','B','X','Q','Z')
);
var SPA = new Array(
  new Array('[&nbsp;]','S','A','R','F','E','G','N','J'),
  new Array('P','D','M','H','L','C','U','K','Q'),
  new Array('T','B','I','W','O','V','Y','Z','X')
);
var memory = new Array('', '', '', '[store');
var punct = new Array('<img src="files/previous.png" alt="retreat one letter" />',
 '<img src="files/next.png" alt="advance one letter" />',
 '<img src="files/first.png" alt="retreat one word" />', 
 '<img src="files/last.png" alt="advance one word" />', 
'.', ',', '?', '"', '`', '!', ':', '$');
var functionsa = new Array('sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt(');
var functionsb = new Array('asin(', 'acos(', 'atan(');


//These two variables are for IE support.
var prevText = "";
var cursor = 0;

//This variable tells whether to update the cursor after a letter is pressed.
var lastKeyChangedText = false;


/*This method is called to add a word to the Memory list.  (This was before version 0.81).  It can also be called without arguments to simply re-spell-out memory on the screen.
*/
function addToMemory(answer) {
  if(answer != null) memory.splice(3, 0, answer);
  if (memory.length > MAX_ARRAY_LENGTH) memory.splice(memory.length-3,1);
  for(j=0;j<memory.length;j++) {
    typer.getElementById("cell"+indexOf(arrayGroup, memory)+j).title = memory[j];
    typer.getElementById("anchor"+indexOf(arrayGroup, memory)+j).innerHTML = memory[j].substring(0, mem_lets);
    if(memory[j].length > mem_lets) typer.getElementById("anchor"+indexOf(arrayGroup, memory)+j).innerHTML += '&#8230;';
  }
}

/* This is called from keyPressed(e, code) when SWITCH1 is pressed.  It advances highlighting from one letter or row to the next on the virtual keyboard. */
function advanceletter() {
  unhighlight(currentIndex);
  try {
    if(currentIndex+1 < currentArray.length)
      currentIndex ++; //Default:  advance index by one.
    else {  //But if we run off the end, mark it down...
      if(repeat > 0) {
        repeat = repeat - 1;
        currentIndex = 0;
      }
      else { //... and if we run off the end three times, reset it to the beginning.
        if(reset) currentIndex = 0;
        else if(gotomem == true && memory[0] != "") currentIndex == arrayGroup.length - 1;
        else currentIndex = indexOf(arrayGroup, currentArray);
        currentArray = arrayGroup;
        repeat = alrepeat;
      }
    }
    highlight(currentIndex)
  }
  catch(except) {  //There shouldn't be an exception.  If so, let us know at once.
alert("Exception!  Please contact the programmers!\n" + except + "\n" + indexOf(arrayGroup, currentArray) + String(currentIndex));
    currentIndex = 0;
    highlight(currentIndex);
  }
}

/* This is a recursive definition of factorial for any integer.  
It is called at appropriate times from parse(oele). 
*/
function factorial(/*String or int*/ n) {
  var nn = parseInt(n); //Note that parseInt of an Int returns the same Int.
  if(nn < 2) return 1;
  else return nn*factorial(nn-1);
}

/* This method is called when an option on the Memory row is selected.  If it is a word-completion suggestion, the beginning of the word is replaced. */
function fromMemory(index) {
  if(index > memory.length - 2) { //if it's "store"
    selectletter(memory[index]);
  }
  if(memory[index] == "") return;
  var myText = focused.value;
  var typedWord = getCurrentWord()
  var toInsert = memory[index];
  if (focused.selectionStart || focused.selectionStart == '0') {	//FIREFOX
    cursor = focused.selectionStart;
  }
  // On IE, cursor is already a global variable.
  if(overtype) {
    if(myText.lastIndexOf(" ", cursor-1) > cursor-typedWord.length)
      myText = myText.substring(0, myText.lastIndexOf(" ", cursor)) + toInsert + myText.substring(cursor);
    else
      myText = myText.substring(0, cursor-typedWord.length) + toInsert + myText.substring(cursor);
  }
  else
    myText = myText.substring(0, cursor) + toInsert + myText.substring(cursor);
  unhighlight(currentIndex);
  currentArray = arrayGroup;
  currentIndex = 0;
  highlight(currentIndex);
  if(overtype) var newCursor = cursor-typedWord.length + toInsert.length;
  else var newCursor = cursor + toInsert.length;
  updateText(newCursor, myText);
}

/*  This method is called from within other methods to get the last word or word fragment before the cursor. */
function getCurrentWord() {
  if (focused.selectionStart || focused.selectionStart == '0') {  // FIREFOX support
    cursor = focused.selectionStart;
  }
  var spaced = focused.value.replace(/\s/g, ' ');
  var tdex = spaced.indexOf(' ', cursor-1);
  if(tdex == -1) tdex = focused.value.length;
  toreturn = spaced.substring(spaced.lastIndexOf(' ', cursor-1)+1, tdex);
  if(toreturn != " ") return toreturn;
  else return "";
}

/* This method simply highlights the proper spot on the virtual keyboard.  If it is in Memory, it expands the highlighted word so all of it, instead of just the first mem_lets letters, is showing.  (This does not apply to word-completion suggestions.) */
function highlight(number)  {
  if(clog) console.log("Array: " + indexOf(arrayGroup, currentArray) + " Element: " + currentIndex);
  cell = typer.getElementById("cell" + indexOf(arrayGroup, currentArray) + String(number));
  cell.style.backgroundColor = H_COL
//If in memory, expand the word
  if(currentArray == memory && cell.title != "") cell.firstChild.innerHTML = cell.title;
}

/* I can't believe JavaScript doesn't provide this functionality.  Well, I had to write it myself.  
If it doesn't find the index, it returns -1, just like in Java. 
*/
function indexOf(arr, elem) {
  for(var i = 0; i < arr.length; i++) {
    if (arr[i] == elem) {
      return i;
      break;
    }
  }
  return -1;
}

/*  General all-purpose function called when a key is pressed. */
function keyPressed(/*Event*/ e, /*int*/ code) {
  if(e != null) code = e.keyCode;
  if(SWITCH1 == code && UseTwoSwitchTyping) {
    advanceletter();
    killEvent(e);
  }
  else if(SWITCH2 == code || (SWITCH2 == -1 && code != -2)) {
    if(currentArray == arrayGroup) { //to select an Array
      unhighlight(currentIndex);
      currentArray = arrayGroup[currentIndex];
      currentIndex = 0;
      highlight(currentIndex);
    }
    else if(currentArray == memory && currentIndex < memory.length - 1) {
      fromMemory(currentIndex);
      prediction();
    }
    else selectletter(currentArray[currentIndex]);
    killEvent(e);
  }
  else if(SWITCH3 == code) {
    runThroughMemory(focused);
    killEvent(e);
  }
  else {  //If user is typing in the <textarea /> by the normal keyboard
    memkey = 0;
    setTimeout("updateCursor()",10);
    setTimeout("prediction()",25);
  }
}


/* This method kills an event by every way possible.  Thanks to Dr. Bishop for this code.
Thanks to "http://siderite.blogspot.com/2006/05/cancel-kill-murder-javascript-event.html" for the first three lines.
*/
function killEvent(eventObject) {
  eventObject.cancel=true;
  eventObject.returnValue=false;
  eventObject.cancelBubble=true;
  if (eventObject && eventObject.stopPropagation)
    eventObject.stopPropagation();
  if (window.event && window.event.cancelBubble )
    window.event.cancelBubble = true;
  if (eventObject && eventObject.preventDefault)
    eventObject.preventDefault();
  if (window.event)
    window.event.returnValue = false;
  if(eventObject && eventObject.preventCapture)
    eventObject.preventCapture();
  if(eventObject && eventObject.preventBubble)
    eventObject.preventBubble();
}


/* This function is called from solveEquationMirror(myText) to eval() individual "words".  It also expands the function abbreviations if it is a mathematical expression. */
function parse(oele) {
  try {
    var ele = oele;
    ele = ele.replace(/π/g, Math.PI);
    ele = ele.replace(/e/g, Math.exp(1));
	if(clog) console.log(ele);
    if(use_rad == true) {  //replace trig functions with inbuilt JS equivalents
      ele = ele.replace(/sin\(/g, 'Math.sin(');
      ele = ele.replace(/cos\(/g, 'Math.cos(');
      ele = ele.replace(/tan\(/g, 'Math.tan(');
      ele = ele.replace(/asin\(/g, 'Math.asin(');
      ele = ele.replace(/acos\(/g, 'Math.acos(');
      ele = ele.replace(/atan\(/g, 'Math.atan(');
    }
    else {  //Same as above, except convert from degrees to radians
      ele = ele.replace(/sin\(/g, 'Math.sin((Math.PI/180)*');
      ele = ele.replace(/cos\(/g, 'Math.cos((Math.PI/180)*');
      ele = ele.replace(/tan\(/g, 'Math.tan((Math.PI/180)*');
      ele = ele.replace(/asin\(/g, '(180/Math.PI)*Math.asin(');
      ele = ele.replace(/acos\(/g, '(180/Math.PI)*Math.acos(');
      ele = ele.replace(/atan\(/g, '(180/Math.PI)*Math.atan(');
    }
    /*
	//Hyperbolic functions - to be done later.
	sinh(x) = (e^x - e^-x )/2
	cosh(x) = (e^x + e^-x )/2
	tanh(x) = sinh(x)/cosh(x)
	sech(x) = 1/cosh(x)
	csch(x) = 1/sinh(x)
	asinh(x) = ln(x+sqrt(x^2+1))
	asinh(x) = ln(x+sqrt(x^2-1))
	atanh(x) = .5*ln((1+x)/(1-x))
	asech(x) = ln( (1+sqrt(1-x^2))/x)
	acsch(x) = ln(1/x + sqrt(1+x^2)/Math.abs(x))
	acoth(x) = .5*ln((x+1)/(x-1))
    */
	var digits = "0123456789.()"
	while(indexOf(ele, 'E') != -1) {
		var i = ele.indexOf("E");
		ele = toFunction(ele, i, "", "*10^");
	}//ele = ele.replace(/E/g, '*10^');
	//Loop to evaluate every power.
    while(indexOf(ele, '^') != -1) { 
      for (var i = 0; i < ele.length; i ++) {
        if(ele.charAt(i) == '^') {
			ele = toFunction(ele, i, "Math.pow");
        }
      }
    }
	//Loop to evaluate every factorial.
	while(indexOf(ele, '!') != -1) {
	  var i = ele.indexOf('!');
//	  ele = toFunction(ele, i, "factorial", "");  //doesn't work b/c factorial is after, not amid
	  var afore = i-1;
	  var inParen = 0;
	  while(!(afore<0)) {
        if(ele.charAt(afore) == ")") inParen++;
        if(ele.charAt(afore) == "(") inParen--;
        afore = afore - 1;
		if(indexOf(digits,ele.charAt(afore)) == -1 && inParen == 0) break;
      }
	  if(clog) console.log("afore = " + afore + " " + ele.charAt(afore));
      ele = (ele.substring(0,afore+1) + "factorial(" + ele.substring(afore+1, i) + ")" + ele.substring(i+1));
      if(clog) console.log(ele);
	}
	
    ele = ele.replace(/ln\(/g, 'Math.log(');  //Note that Math.log is natural logarithm.
	ele = ele.replace(/log\(/g, '(1/Math.log(10))*Math.log(');  //default log is base 10
	//I want to convert log(a,b) to (1/Math.log(b))*Math.log(, to allow any base, but it's too complicated
    ele = ele.replace(/sqrt\(/g, 'Math.sqrt(');
    var bfparen = /\d\(/;
    while(ele.search(bfparen) != -1) {//when a digit's next to parentheses, insert multiplication sign.
      ale = ele.substring(0, ele.search(bfparen)+1);
       va = ale.concat('*', ele.substring(ele.search(bfparen)+1));
       ele = va;
    }
    if(clog) console.log("Final ele to eval(): " + ele);
    evaled = eval(ele);
    if(evaled === String(evaled)) { //if it's a string
	  if(clog) console.log("It's a string!");
      return eval(oele);
	}
    else return evaled;
  }
  catch(except) {return "=improper";}
}

/* This method gets the options values out of the URL.  Note that it doesn't understand % encoding.  It is called from JavaScript in the <head /> of each file. */
function parseURL(url) {
 if(url == null) url = location.href;
  var optionsWithValues = url.substring(url.indexOf("?")+1).split("&");
  var currentOption;
  var currentValue;
  for (var k = 0; k < optionsWithValues.length; k++) {
    if(optionsWithValues[k].substring(0, optionsWithValues[k].indexOf('=')) == "addi") {
      addi = optionsWithValues[k].substring(optionsWithValues[k].indexOf('=')+1).split("_");
      continue;
    }

    try {
      eval(optionsWithValues[k]);
    }
    catch(except) {
      try {  //If it isn't a legal statement as it stands, try interpreting the value as a string.
        var quoted = optionsWithValues[k].substring(0, optionsWithValues[k].indexOf('=')+1) + '"' + 
                   optionsWithValues[k].substring(optionsWithValues[k].indexOf('=')+1) + '"';
        eval(quoted);
      }
      catch(exceptio) {  //If even that doesn't work, something got corrupted.  Declare the error.
        alert('Error parsing ' + optionsWithValues[k]);
      }
    }
  }
}

/* First calls solveEquation() to see if it should show a math answer or variable expansion.  If solveEquation() returns invalid, it goes on a linear search of frequency lists for the top three words to begin with getCurrentWord().  Then, it adds them directly to Memory. 
*/
function prediction() {
  var oneSug = "";
  var twoSug = "";
  var threeSug = "";
  try {
    var msol = solveEquation();  //Note that ssol is a string, eg "=5"
    var ssol = String(msol);
//    if(clog) console.log("msol=" + msol);
    if(ssol != "=improper" && ssol != "=NaN" && ssol.indexOf("[") == -1) {
      oneSug = ssol;
      //overtype is now reset in solveEquation()
    }
  }
  catch(e) {  //This should never happen.
    document.getElementById('caplock').innerHTML += ("<br />Error in solveEquation() caught by prediction().  Details:<br />" + e);
  }
  if(oneSug == "") {
    var currentWord = getCurrentWord().toLowerCase();
    if(oneSug == currentWord) oneSug = "";
    if(twoSug == currentWord) twoSug = "";
    if(threeSug == currentWord) threeSug = "";
    if(currentWord.length > 1) {
      var jj = 0;
      while(!threeSug) {
        try {
          while((frequent[jj].toLowerCase().substring(0, currentWord.length) != currentWord)) {
            jj++;
          }
        }
        catch(e) {
          break;
        }
        if(frequent[jj].toLowerCase() == currentWord.toLowerCase()
                          || oneSug.toLowerCase() == frequent[jj].toLowerCase()
                          || twoSug.toLowerCase() == frequent[jj].toLowerCase()) {
          jj++;
          continue;
        }

  var toInsert = frequent[jj];
  var typedWord = getCurrentWord();
  //Code to specify capitalization of word.  Moved from fromMemory()
  if(typedWord.charAt(0) == typedWord.charAt(0).toUpperCase() && typedWord.charAt(1) == typedWord.charAt(1).toUpperCase())//If first two letters caps, continue as all caps.
    toInsert = toInsert.toUpperCase();
  for(var k = 0; k < typedWord.length; k++) {
    var cL = typedWord.charAt(k);
    var pL = toInsert.charAt(k);
    if(cL != pL && cL.toLowerCase() == pL.toLowerCase())
      toInsert = toInsert.replace(pL, cL);
  }


        if(oneSug == "") {
          oneSug = toInsert;
          jj++;
          overtype = true;  //reset in case an equation was previously used
        }
        else if (twoSug == "") {
          twoSug = toInsert;
          jj++;
        }
        else {
          threeSug = toInsert;
        }
      }
    }
  }
  if(oneSug != "") {
    memory[0] = oneSug;
  }
  else memory[0] = "";
  if(twoSug != "") memory[1] = twoSug;
  else memory[1] = "";
  if(threeSug != "") memory[2]= threeSug;
  else memory[2] = "";
  for(j=0;j<3;j++)
    typer.getElementById("anchor"+indexOf(arrayGroup, memory)+j).innerHTML = memory[j];
}

/* Called when "\" (or other choice set in the Options page) is pressed.  Calls fromMemory(memkey) with the appropriate index and advances that index.  (Note that index is reset in keyPressed(e, code).
*/
function runThroughMemory() {
  fromMemory(memkey);
  memkey++;
  if(memkey==memory.length-1) memkey=0;
}

/* Called ONLY when one-switch-typing is set.  Advances letter after each timerLength and re-calls itself by calling setTimeout().
*/
function runTimer(array, index) {
  if(NOW_SCANNING && currentArray == array && currentIndex == index){  //I don't know what'd ever make it false... maybe a key?
    advanceletter();
  }
  setTimeout("runTimer(currentArray, currentIndex);", timerLength);
}

/*  The general selection of letters, from a lookup table or by simply adding the letter if it's a normal letter.
Note that this is never called on the word-prediction slots; for them, fromMemory(index) is called directly from keyPressed(e, code).
*/
function selectletter(letter) {
  var myText = focused.value;
  var addition = ""; var additionLength = 0;
  memkey = 0;
if(clog) console.log(letter + ' cursor at ' + cursor);
  if(letter.charAt(0) !='[' && letter.indexOf('<img') == -1) {
    if (letter == '&pi;')
      addition = 'π';
    else if (caplock == true)
      addition = letter;
    else if (shifted == true) {
      addition = letter;
      shifted = false;
    }
    else
      addition = letter.toLowerCase();
  }
  else if(letter == '[&nbsp;]')
    addition = ' ';
  else if (letter.indexOf('pilcrow.png') != -1)
    addition = '\n';
  else if (letter.indexOf('backspace.png') != -1) {
    myText = myText.substring(0,cursor-1) + myText.substring(cursor);
    additionLength = -1;
  }
  else if (letter.indexOf('backspace_w.png') != -1) {
    additionLength = 0 - getCurrentWord().length;
    myText = myText.substring(0, cursor-getCurrentWord().length) + myText.substring(cursor);
  }
  else if (letter.indexOf('alpha.png') != -1) {
    caplock = !caplock;
    if(caplock) typer.getElementById("caplock").innerHTML = "ON";
    else typer.getElementById("caplock").innerHTML = "OFF";
  }
  else if (letter.indexOf('shift.png') != -1) {
    shifted = !shifted;
  }
  else if (letter == '[help') {
    newwindow = window.open("about.html#typing",'CalcuType: help','height=600,width=600');
  }

  else if (letter == '[store') {
     addToMemory(getCurrentWord());
  }
  else if (letter.indexOf('new-form.PNG') != -1) {
    if(focused == typer.getElementById('url') && typer.getElementById('url').value != '') {
      unhighlight(currentIndex);
      currentArray = arrayGroup; currentIndex = 0;
      highlight(currentIndex);
      typer.getElementById('loader').style.visibility = 'collapse';
      typer.getElementById('uploader').style.visibility = 'collapse';
      loadNewForm(typer.getElementById('url').value);
    }
    else {
      typer.getElementById('url').value = "";
      typer.getElementById('loader').style.visibility = 'visible';
      typer.getElementById('uploader').style.visibility = 'visible';
      typer.getElementById('url').focus();
      focused = typer.getElementById('url');
      myText = null;
    }
  }
  else if(letter.indexOf('tab.png') != -1) {
    advanceFocus();
    prevText = focused.value;
    cursor = focused.value.length + 1;
  }
  else if(letter.indexOf('drive_disk.png') != -1) {
    writeToServer();
  }
  else if(letter.indexOf('previous.png') != -1) {
    updateText(cursor-1, myText);
  }
  else if(letter.indexOf('next.png') != -1)
    updateText(cursor+1, myText);
  else if(letter.indexOf('first.png') != -1) {
    updateText(focused.value.replace(/\s/g, ' ').lastIndexOf(' ', cursor-2), myText);
  }
  else if(letter.indexOf('last.png') != -1)
    updateText((focused.value + ' ').replace(/\s/g, ' ').indexOf(' ', cursor)+1, myText);
  repeat = alrepeat;
  if (additionLength == 0) additionLength = addition.length;
  lastKeyChangedText = (additionLength != 0);
  myText = myText.substring(0, cursor) + addition + myText.substring(cursor);
  if(letter.indexOf('tab.png') == -1) {
    if(lastKeyChangedText) updateText(cursor + additionLength, myText);
  }
  prediction();
  unhighlight(currentIndex);
  if(clog) console.log(gotomem == true && memory[0] != "");
  if(gotomem == true && memory[0] != "") currentIndex = arrayGroup.length - 1;
  else if(reset) currentIndex = 0;
  else currentIndex = indexOf(arrayGroup, currentArray);
  currentArray = arrayGroup;
  highlight(currentIndex);
  return null;
}

/* Locates the cursor and calls solveEquationMirror on everything before the cursor.  If this returns an error, it calls solveEquationMirror on focused.value
*/
function solveEquation() {
  var returned;
  if(!focused || focused == null) {
    addToMemory('unfocused!');
    return;
  }
  if(focused.selectionStart || focused.selectionStart == "0")
    returned = solveEquationMirror(focused.value.substring(0, focused.selectionStart));
  else
    returned = solveEquationMirror(focused.value.substring(0, cursor));
  if(returned == null || String(returned) == "improper" || String(returned) == "NaN")
    return solveEquationMirror(focused.value);
  else
    return returned;
}

/* Breaks myText up into individual words (at spaces and carriage returns; note it does NOT call getCurrentWord() ) 
and calls parse(oele) on each of them.  If parse(oele) returns a string (in other words, if it's a user-defined variable)
 it sets overtype to true; otherwise, it sets it to false and returns "=n" for n equal to a number or "NaN". */
function solveEquationMirror(myText) {
  var sameText = myText.replace(/\n/g, ' ');
  var k = sameText.split(' ');
  if(clog) console.log(k);
  if(k[k.length-1] == "") return "=NaN";
  for(toparse = 0; toparse < k.length; toparse++) {
    var parsed = parse(k[toparse]);
  }
  if(clog) console.log(parsed);
  if(parsed === String(parsed)) {
    if(clog) console.log("It's a string!");
    overtype = true;
    return parsed;
  }
  else overtype = false;
  if(String(parsed).indexOf("e") != -1) {
    if (clog) console.log("Already in scinot.");
	return "=" + Math.round(parsed*Math.pow(10,precision))/Math.pow(10,precision);
  }
  else if(parsed > Math.pow(10, SIG_FIGS)) {
    var reduceBy = Math.floor((1/Math.log(10))*Math.log(parsed))+1 - SIG_FIGS;
    var toDisplay = Math.round(parsed/Math.pow(10, reduceBy));
    return toDisplay/Math.pow(10, Math.floor(1/Math.log(10)*Math.log(toDisplay))) + "E" +
               (reduceBy+Math.floor(1/Math.log(10)*Math.log(toDisplay)));
  }
  else if(parsed < Math.pow(10, -SIG_FIGS)) {
    var raiseBy = Math.abs(Math.floor((1/Math.log(10))*Math.log(parsed)))
    var toDisplay = parsed*Math.pow(10, raiseBy);
	toDisplay = Math.round(toDisplay*Math.pow(10,SIG_FIGS-1))/Math.pow(10,SIG_FIGS-1);
	if(clog) console.log("ToDisplay: " + toDisplay);
    return toDisplay/Math.pow(10, Math.floor(1/Math.log(10)*Math.log(toDisplay))) + "E-" + raiseBy;
  }
  else return "=" + Math.round(parsed*Math.pow(10,precision))/Math.pow(10,precision);
  //Note this last line returns NaN on anything except an actual number.
}

/* This function converts from mid-notation (e.g. 5^3) to function notation
(e.g. Math.pow(5,3) ).*/
function toFunction(/*String*/ ele, /*int*/ i, /*String*/ functionName, /*String*/ divider) {
	if(divider == null) divider =  ",";
	var afore = i - 1;
	var inParen = 0;
	while(!(afore<0)) {
		if(ele.charAt(afore) == ")") inParen++;
		if(ele.charAt(afore) == "(") inParen--;
		afore = afore - 1;
		if(indexOf(digits,ele.charAt(afore)) == -1 && inParen == 0) break;
	}
	if(clog) console.log("afore = " + afore + " " + ele.charAt(afore));
	var after = i + 1;
	inParen = 0;
	while(!(after > ele.length)) {
		if(ele.charAt(after) == ")") inParen++;
		if(ele.charAt(after) == "(") inParen--;
		after++;
		if(indexOf(digits,ele.charAt(after)) == -1 && inParen == 0) break;
	}
	if(clog) console.log("after = " + after + " " + ele.charAt(after));
	ele = (ele.substring(0,afore+1) + functionName + "(" + ele.substring(afore+1, i) + divider + ele.substring(i+1, after) + ")" + ele.substring(after));
	if(clog) console.log(ele);
	return ele;
}

/* Simply unhighlights the proper spot on the virtual keyboard.  If it's in Memory, it compresses it to the first mem_lets letters.  (Note it does NOT do this on word-completion choices. */
function unhighlight(number)  {
  cell = typer.getElementById("cell" + indexOf(arrayGroup, currentArray) + String(number));
  cell.style.backgroundColor = ''
//If in memory, compress the word
  if(currentArray == memory && number > 2)
    cell.firstChild.innerHTML = cell.firstChild.innerHTML.substring(0, mem_lets);
    if(cell.title.length > mem_lets) typer.getElementById("anchor"+indexOf(arrayGroup, memory)+j).innerHTML += '&#8230;';
}


/*
This function is used to keep a running log of cursor position for IE users.
Currently, cursor would at 0 when it's advanced 
- except the positioning is handled locally in selectletter().
*/
function updateCursor() {
  for(var n = 0; n < focused.value.length; n++) {
    if(focused.value.charAt(n) != prevText.charAt(n)) {
      cursor = n + 1;
      prevText = focused.value;
      return;
    }
  }
  cursor = focused.value.length;
  prevText = focused.value;
  return;
}

/* Updates focused.value to match myText.  Also puts cursor at newcursor, if it doesn't equal null. */
function updateText(newcursor, myText) {
  focused.focus();
if(clog) console.log("In updateText().  Mytext = " + myText);
  focused.value = myText;
  if(newcursor != null) {
     if (focused.selectionStart || focused.selectionStart == '0') {
      //FIREFOX support
      focused.selectionStart = newcursor;
      focused.selectionEnd = newcursor;
    }
    else {
      //IE support - borrowed from 
      //"http://bytes.com/forum/thread147459.html"
      var range = focused.createTextRange();
      range.collapse(true);
      range.moveEnd('character', newcursor);
      range.moveStart('character', newcursor);
      range.select();
    }
  cursor = newcursor;
  }
  else { //default:  put cursor at end.  Works in both browsers.
    focused.blur();
    focused.focus();
    setTimeout("updateCursor()",20);
  }
//  scroll(0,100000);
}



/* The following four functions are contained in the individual .html files.

function writeToServer(text) {
//in newdoc version
}
function advanceFocus() {
//in frameset version
}
function loadNewForm(newurl) {
//in frameset version
}
function readyForm() {
//in frameset version
}
*/