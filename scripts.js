document.addEventListener('DOMContentLoaded', () => {
  // Get the words from the .words div and split them into an array
  const wordsDiv = document.querySelector('.words');
  const wordsText = wordsDiv.textContent.trim();
  const wordsArray = wordsText.split(/\s+/);

  const displayWordDiv = document.querySelector('.display-word');
  const wordCountDiv = document.querySelector('.word-count');
  const nextWordButton = document.getElementById('next-word-button');
  const repeatWordButton = document.getElementById('repeat-word-button');
  const voiceSelect = document.getElementById('voice-select');

  // Modify selectors for the new radio inputs
  const showRadio = document.getElementById('option-show');
  const sayRadio = document.getElementById('option-say');

  let currentIndex = 0;
  let shuffledWords = [];
  let currentWord = ''; // To keep track of the current word
  let voices = [];

  // Function to shuffle the words array
  function shuffleArray(array) {
    // Using Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Initialize the shuffled words array
  function initializeWords() {
    shuffledWords = [...wordsArray]; // Create a copy of the wordsArray
    shuffleArray(shuffledWords);
    currentIndex = 0;
    updateWordCount();
  }

  // Function to populate the voice list
  function populateVoiceList() {
    voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      // Voices not loaded yet, try again shortly
      setTimeout(populateVoiceList, 100);
      return;
    }

    // Filter voices to only include English languages
    voices = voices.filter(voice => voice.lang.startsWith('en'));

    // Clear the voice selection dropdown
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' [Default]' : ''}`;
      voiceSelect.appendChild(option);
    });

    // Set default voice to a preferred one, e.g., "Alex" if available
    const defaultVoiceIndex = voices.findIndex(voice => voice.name === 'Alex');
    if (defaultVoiceIndex !== -1) {
      voiceSelect.selectedIndex = defaultVoiceIndex;
    } else {
      voiceSelect.selectedIndex = 0; // Default to the first voice in the list
    }
  }

  // Fetch voices. Some browsers may not have them immediately available.
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.addEventListener('voiceschanged', populateVoiceList);
    populateVoiceList(); // Call it initially in case voices are already loaded
  }

  // Function to get the selected option
  function getSelectedOption() {
    return showRadio.checked ? 'show' : 'say';
  }

  // Function to display or say a word
  function displayWord(word) {
    const selectedOption = getSelectedOption();

    if (selectedOption === 'show') {
      displayWordDiv.textContent = word;
    } else if (selectedOption === 'say') {
      displayWordDiv.textContent = '';

      // Use the selected voice
      const utterance = new SpeechSynthesisUtterance(word);
      const selectedVoiceIndex = voiceSelect.value;
      if (voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  // Function to display or say the next word
  function displayNextWord() {
    if (currentIndex >= shuffledWords.length) {
      // All words have been shown; reshuffle and start over
      alert('All words have been displayed. Starting over with a new shuffle!');
      initializeWords();
    }

    currentWord = shuffledWords[currentIndex];
    displayWord(currentWord);

    currentIndex++;
    updateWordCount();

    // Enable the "Repeat Word" button
    repeatWordButton.disabled = false;
  }

  // Function to repeat the current word
  function repeatCurrentWord() {
    if (currentWord) {
      displayWord(currentWord);
    } else {
      alert('No word to repeat. Please click "Next Word" to start.');
    }
  }

  // Function to update the word count display
  function updateWordCount() {
    // Adjusting count to start from 1 instead of 0
    wordCountDiv.textContent = `Word ${currentIndex + 1} of ${shuffledWords.length}`;
  }

  // Event listener for the "Next Word" button
  nextWordButton.addEventListener('click', displayNextWord);

  // Event listener for the "Repeat Word" button
  repeatWordButton.addEventListener('click', repeatCurrentWord);

  // Initialize the words
  initializeWords();
});
