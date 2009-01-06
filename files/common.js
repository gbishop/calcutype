﻿/*
COMMENT: Most variables are initialized in their own file.
GENERAL NOTE:  I am setting cursor so that it equals selectionStart in Firefox:  one after the last-typed character.
DOCUMENTATION:  substring arguments are startAt and endBefore.
*/


var digits = new Array('1','2','3','4','5','6','7','8','9','0');
var operators = new Array('+','-','*','/','=', '(',')', '%', '&pi;');
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

//These two variables are for IE support.
var prevText = "";
var cursor = 0;

//This variable tells whether to update the cursor after a letter is pressed.
var lastKeyChangedText = false;


/*This method can also be called without arguments
to simply re-spell-out memory on the screen.
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



function fromMemory(index) {
  if(index > memory.length - 2) { //if it's "store"
    selectletter(memory[index]);
  }
  if(memory[index] == "") return;
  var myText = focused.value;
  var typedWord = getCurrentWord()
  var toInsert = memory[index];
  if(caplock)	//If caps lock is on, continue it as all capitals.
    toInsert = toInsert.toUpperCase();
  for(var k = 0; k < typedWord.length; k++) {
    var cL = typedWord.charAt(k);
    var pL = toInsert.charAt(k);
    if(cL != pL && cL.toLowerCase() == pL.toLowerCase())
      toInsert = toInsert.replace(pL, cL);
  }
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

function highlight(number)  {
  cell = typer.getElementById("cell" + indexOf(arrayGroup, currentArray) + String(number));
  cell.style.backgroundColor = H_COL
//If in memory, expand the word
  if(currentArray == memory && cell.title != "") cell.firstChild.innerHTML = cell.title;
}


function indexOf(arr, elem) {
  for(var i = 0; i < arr.length; i++) {
    if (arr[i] == elem) {
      return i;
      break;
    }
  }
  return -1;
}


function keyPressed(e, code) {
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
    else selectletter(currentArray[currentIndex]);
    killEvent(e);
  }
  else if(SWITCH3 == code) {
    runThroughMemory(focused);
    killEvent(e);
  }
  else {
    memkey = 0;
    setTimeout("updateCursor()",10);
    setTimeout("prediction()",25);
  }
}


//This method kills an event by every way possible.  Thanks to Dr. Bishop for this code.
//Thanks to "http://siderite.blogspot.com/2006/05/cancel-kill-murder-javascript-event.html" for the first three lines.

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



function parse(ele) {
  try {
    ele = ele.replace('π', Math.PI);
    ele = ele.replace('e', Math.exp(1));
    if(use_rad == true) {
      ele = ele.replace('sin(', 'Math.sin(');
      ele = ele.replace('cos(', 'Math.cos(');
      ele = ele.replace('tan(', 'Math.tan(');
      ele = ele.replace('asin(', 'Math.asin(');
      ele = ele.replace('acos(', 'Math.acos(');
      ele = ele.replace('atan(', 'Math.atan(');
    }
    else {
      ele = ele.replace('sin(', 'Math.sin((Math.PI/180)*');
      ele = ele.replace('cos(', 'Math.cos((Math.PI/180)*');
      ele = ele.replace('tan(', 'Math.tan((Math.PI/180)*');
      ele = ele.replace('asin(', '(180/Math.PI)*Math.asin(');
      ele = ele.replace('acos(', '(180/Math.PI)*Math.acos(');
      ele = ele.replace('atan(', '(180/Math.PI)*Math.atan(');
    }
    ele = ele.replace('ln(', 'Math.log(');
    ele = ele.replace('sqrt(', 'Math.sqrt(');
    var bfparen = /\d\(/;
    while(ele.search(bfparen) != -1) {//when a digit's next to parentheses, insert multiplication sign.
      ale = ele.substring(0, ele.search(bfparen)+1);
       va = ale.concat('*', ele.substring(ele.search(bfparen)+1));
       ele = va;
    }
    return eval(ele);
  }
  catch(except) {return "improper";}
}


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

function prediction() {
  var oneSug = "";
  var twoSug = "";
  var threeSug = "";
  try {
    var msol = solveEquation();
    var ssol = String(msol);
    if(ssol != "improper" && ssol != "NaN" && ssol.indexOf("[") == -1) {
      oneSug = "=" + msol;
      overtype = false;
    }
  }
  catch(e) {  //This should never happen.
    alert("Exception in solveEquation() caught by prediction().  Please contact the author of this program.  Details:\n" + e);
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
        if(oneSug == "") {
          oneSug = frequent[jj];
          jj++;
          overtype = true;  //reset in case an equation was previously used
        }
        else if (twoSug == "") {
          twoSug = frequent[jj];
          jj++;
        }
        else {
          threeSug = frequent[jj];
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

function runThroughMemory() {
  fromMemory(memkey);
  memkey++;
  if(memkey==memory.length-1) memkey=0;
}

function runTimer(array, index) {
  if(NOW_SCANNING && currentArray == array && currentIndex == index){  //I don't know what'd ever make it false... maybe a key?
    advanceletter();
  }
  setTimeout("runTimer(currentArray, currentIndex);", timerLength);
}


function selectletter(letter) {
  var myText = focused.value;
  var addition = ""; var additionLength = 0;
  memkey = 0;
  if(currentArray == memory && currentIndex < memory.length - 2) {
    if(overtype)  //if we aren't completing equations
      return fromMemory(currentIndex);
    else
      overtype = false;
  }
  if(letter.charAt(0) !='[') {
    if (letter == '&pi;')
      addition = 'π';
    else if (caplock == true)
      addition = letter;
    else
      addition = letter.toLowerCase();
  }
  else if(letter == '[&nbsp;]')
    addition = ' ';
  else if (letter == '[&para;' || letter == '[¶]')
    addition = '\n';
  else if (letter == '[&laquo;]' || letter == '[«]') {
    myText = myText.substring(0,cursor-1) + myText.substring(cursor);
    additionLength = -1;
  }
  else if (letter == '[&laquo;w]' || letter == '[«w]') {
    additionLength = 0 - getCurrentWord().length;
    myText = myText.substring(0, cursor-getCurrentWord().length) + myText.substring(cursor);
  }
  else if (letter.indexOf('alpha.png') != -1) {
    caplock = !caplock;
    if(caplock) typer.getElementById("caplock").innerHTML = "ON";
    else typer.getElementById("caplock").innerHTML = "OFF";
  }
  else if (letter == '[store') {
     addToMemory(getCurrentWord());
  }
  else if (letter == '[new') {
    if(focused == typer.getElementById('url') && typer.getElementById('url').value != '') {
      unhighlight(currentIndex);
      currentArray = arrayGroup; currentIndex = 0;
      highlight(currentIndex);
      typer.getElementById('loader').style.visibility = 'hidden';
      loadNewForm(typer.getElementById('url').value);
    }
    else {
      typer.getElementById('url').value = "";
      typer.getElementById('loader').style.visibility = 'visible';
      typer.getElementById('url').focus();
      focused = typer.getElementById('url');
      myText = null;
    }
  }
  else if (letter == '[&#8594;' || letter == '[→') {
    advanceFocus();
    prevText = focused.value;
    cursor = focused.value.length + 1;
  }
  else if(letter.indexOf('drive_disk.png') != -1) {
    writeToServer(myText);
  }
  else if(letter.indexOf('resultset_previous.png') != -1) {
    updateText(cursor-1, myText);
  }
  else if(letter.indexOf('resultset_next.png') != -1)
    updateText(cursor+1, myText);
  else if(letter.indexOf('resultset_first.png') != -1) {
    updateText(focused.value.replace(/\s/g, ' ').lastIndexOf(' ', cursor-2), myText);
  }
  else if(letter.indexOf('resultset_last.png') != -1)
    updateText(focused.value.replace(/\s/g, ' ').indexOf(' ', cursor)+1, myText);
  repeat = alrepeat;
  unhighlight(currentIndex);
  if(reset) currentIndex = 0;
  else currentIndex = indexOf(arrayGroup, currentArray);
  currentArray = arrayGroup;
  highlight(currentIndex);
  if (additionLength == 0) additionLength = addition.length;
  lastKeyChangedText = (additionLength != 0);
  myText = myText.substring(0, cursor) + addition + myText.substring(cursor);
  if (letter != '[&#8594;' && letter != '[→') {
    if(lastKeyChangedText) updateText(cursor + additionLength, myText);
  }
  prediction();
  return null;
}


function solveEquation() {
  var returned;
  if(focused.selectionStart || focused.selectionStart == "0")
    returned = solveEquationMirror(focused.value.substring(0, focused.selectionStart));
  else
    returned = solveEquationMirror(focused.value.substring(0, cursor));
  if(returned == null || String(returned) == "improper" || String(returned) == "NaN")
    return solveEquationMirror(focused.value);
  else
    return returned;
}

function solveEquationMirror(myText) {
  var sameText = myText.replace(/\n/g, ' ');
  var k = sameText.split(' ');
  if( k[k.length-1].search(/[^0123456789 ]/) == -1 || k[k.length-1] == " ")  //if there're no digits in the last "word"
    return "improper";
  for(i = 0; i < k.length; i++) {
    var n = parse(k[i]);
  }
  return Math.round(n*Math.pow(10,precision))/Math.pow(10,precision);
}

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

function updateText(newcursor, myText) {
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



/* The following four functions will stay in their own files.

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