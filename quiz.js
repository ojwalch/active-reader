
// Question holder and number of questions
var questionHolder = new Array();
var numberOfQuestions;

// Currently displayed question
var questionNumber = 0;

// Locks question after selection
var isQuestionLocked = false;

// Container for answers
var answerArray = new Array();

// Index and text of current correct answer
var currentAnswer = 0;
var correctAnswer = "";

// Layout for questions
var questionPanel = "#questionPanel";

// Track score
var score = 0;


// Hide the input area
function hideInput(){
    document.getElementById("textInput").style.display = 'none';
    document.getElementById("topBar").style.display = 'none';
    document.getElementById("explainer").style.display = 'none';
}

// Get rid of duplicates in an array
function removeDuplicates(arr) {
    var temp = {};
    for (var i = 0; i < arr.length; i++)
        temp[arr[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

// Get rid of punctuation in an array
function removePunctuation(arr){
    var temp = [];
    for(var i = 0; i < arr.length; i++){
        temp[i] = arr[i].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
    }
    return temp;
}

// Remove sentences that end in a single letter and those that start with something not a capital letter
function removeBadSentences(arr){
    var temp = [];
    var count = 0;
    
    for(var i = 0; i < arr.length; i++){
        var thisSentence = arr[i];
        
        var firstChar = thisSentence.charAt(0);
        
        if(firstChar === " "){
            firstChar =  thisSentence.charAt(1);
        }
        
        var theseWords = thisSentence.split(" ");
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        if(alphabet.indexOf(firstChar) > -1 && theseWords[theseWords.length-1].length > 1){
            temp[count] = thisSentence;
            count = count + 1;
        }
    }
    return temp;
}


// Called when 'Generate Quiz' is clicked
function parseString(){
    
    
    // Clean text of newlines
    var allText = document.getElementById("allText").value;
    allText = allText.replace(/\n/g, " ");
    
    // Remove parentheticals
    allText = allText.replace(/ *\([^)]*\) */g, "");
    
    // Make dictionary list with stopwords removed.
    var allWords = allText.removeStopWords().split(" ");
    allWords = removePunctuation(allWords);
    allWords = removeDuplicates(allWords);
    
    console.log(allWords);
    if(allWords.length > 5){
        
        // Hide initial input location
        hideInput();
        
        
        // Split allText into sentences, keeping the delimiters.
        var allSentences = allText.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
        
        //Remove bad sentences
        allSentences = removeBadSentences(allSentences);
        
        // For each sentence...
        for(var i = 0; i < allSentences.length; i++){
            
            // Get sentence instance
            var thisSentence = allSentences[i];
            
            // Remove characters, split on spaces
            var removableWords = thisSentence.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").removeStopWords().split(" ");
            
            // Pick one word at random
            var removedWord = removableWords[Math.floor(Math.random()*removableWords.length)];
            
            // Replace removed word with a line
            var removedWordSentence = thisSentence.replace(removedWord,"______________");
            
            // Make an array with the sentence, minus the removed word, the removed word, and three other random words
            questionHolder[i] = new Array;
            questionHolder[i][0] = removedWordSentence;
            questionHolder[i][1] = removedWord;
            
            
            // Generate other choices
            var numberOfOptions = 4;
            var shuffledAllWords = shuffleArray(allWords);
            var otherOptions = shuffledAllWords.slice(0,numberOfOptions - 1);
            
            
            var count = 0;
            var countThresh = 100;
            
            // Try to ensure there aren't repeats
            while(arrayContainsWord(otherOptions,removedWord) && count < countThresh){
                
                var shuffledAllWords = shuffleArray(allWords);
                otherOptions = shuffledAllWords.slice(0,numberOfOptions - 1);
                count = count + 1;
                
            }
            
            
            // Add other options to array and match capitalizations
            for(var j = 1; j < numberOfOptions; j++){
                
                var thisOption = otherOptions[j - 1];
                var firstChar = removedWord.charAt(0);
                
                if(firstChar === firstChar.toUpperCase()){
                    thisOption = capitalizeFirstLetter(thisOption);
                }else{
                    thisOption = lowercaseFirstLetter(thisOption);
                }
                
                questionHolder[i][j + 1] = thisOption;
                
            }//j
        }//i
        
        numberOfQuestions = questionHolder.length;
        
        
        showQuestion();
    }else{
        alert("Text not long enough! Please enter more text.");
    }
    
}


// Exactly what they sound like
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}


// Check to see if a word is contained in the array
function arrayContainsWord(arr,word){
    var isTrue = 0;
    for(var i = 0; i < arr.length; i++){
        if(arr[i] === word){
            isTrue = 1;
        }
    }
    return isTrue;
}


function showQuestion(){
    var numberOfOptions = questionHolder[questionNumber].length - 1;
    
    answerArray = [];
    
    // Populate answerArray
    for(var i = 0; i < numberOfOptions; i++){
        answerArray[i] = questionHolder[questionNumber][i+1];
    }
    
    // Get first (correct) answer; then shuffle
    correctAnswer = answerArray[0];
    shuffleArray(answerArray);
    
    // Find the index of the correct answer if the shuffled output
    for(var i = 0; i < numberOfOptions; i++){
        if(answerArray[i] == correctAnswer){
            currentAnswer = i + 1;
        }
    }
    
    // Add question text
    $(questionPanel).append('<div class="questionText">' + questionHolder[questionNumber][0]+'</div>');
    
    // Add options
    for(var i = 0; i < answerArray.length; i++){
        $(questionPanel).append('<div id="'+[i+1]+'" class="option">'+answerArray[i]+'</div>');
    }
    
    // Handle option click
    $('.option').click(function(){
                       if(isQuestionLocked == false){
                       isQuestionLocked = true;
                       
                       if(this.id == currentAnswer){
                       $(questionPanel).append('<div class="correct">Correct</div>');
                       score++;
                       }
                       
                       if(this.id != currentAnswer){
                       $(questionPanel).append('<div class="incorrect">Incorrect</div>');
                       }
                       
                       setTimeout(function(){
                                  nextQuestion()},200);
                       }
                       });
    
}

// Load next question
function nextQuestion(){
    questionNumber++;
    questionPanel = "#questionPanel";
    $(questionPanel).empty();
    
    if(questionNumber < numberOfQuestions){
        showQuestion();
    }else{
        displaySummary();
    }
    
    isQuestionLocked = false;
}


// Load next question
function reset(){
    
    $(questionPanel).empty();
    
    document.getElementById("textInput").style.display = 'block';
    document.getElementById("topBar").style.display = 'block';
    document.getElementById("explainer").style.display = 'block';
    
    
    // Question holder and number of questions
    questionHolder = new Array();
    
    // Currently displayed question
    questionNumber = 0;
    
    // Locks question after selection
    isQuestionLocked = false;
    
    // Container for answers
    answerArray = new Array();
    
    // Index and text of current correct answer
    currentAnswer = 0;
    correctAnswer = "";
    
    // Layout for questions
    questionPanel = "#questionPanel";
    
    // Track score
    score = 0;
    
}



// Display summary slide
function displaySummary(){
    $(questionPanel).append('<div class="questionText">Active reading complete!<br><br><br>Total sentences: '+numberOfQuestions+'<br>Correct answers: ' + score + '</div><br><input type="button" onclick="reset()" value="Generate New Quiz" class="button"/>');
}


// Shuffle array contents
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
    return array;
}


$(document).ready(function () {
                  });
