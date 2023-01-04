// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import { showNotification } from './modules/showNotification.js';
import axios from 'axios';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='dictionary'>
    <h2 class='title'>English Dictionary</h2>
    <form data-form=''>
      <label>
        <input type='text' placeholder='Search a word' name='word' spellcheck='false' data-form-input=''>
        <div>${feather.icons.search.toSvg()}</div>
        <button class='dictionary__reset hide' type='button' data-form-clear=''>
          ${feather.icons.x.toSvg()}
        </button>
      </label>
    </form>
    <p class='dictionary__info' data-info=''>Type any existing word and press enter to get meaning, example, synonyms, etc.</p>
    <div class='dictionary__result hide' data-result=''>

      <div class='dictionary__word'>
        <div class='dictionary__word-detail' data-word=''>
          <span class='h4'>car</span>
          <p>noun //kɑː//</p>
        </div>
        <button data-speech=''>
          ${feather.icons['volume-2'].toSvg()}
        </button>
      </div>

      <div class='dictionary__meaning' data-meaning=''>
        <h3 class='h5'>Meaning</h3>
        <p></p>
      </div>

      <div class='dictionary__example' data-example=''>
        <h3 class='h5'>Example</h3>
        <p></p>
      </div>

      <div class='dictionary__synonyms' data-synonyms=''>
        <h3 class='h5'>Synonyms</h3>
        <ul></ul>
      </div>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    // Query selectors
    this.DOM = {
      form: {
        self: document.querySelector('[data-form]'),
        btn: document.querySelector('[data-form-clear]'),
        input: document.querySelector('[data-form-input]'),
      },
      infoText: document.querySelector('[data-info]'),
      result: {
        self: document.querySelector('[data-result]'),
        word: document.querySelector('[data-word]'),
        speech: document.querySelector('[data-speech]'),
        meaning: document.querySelector('[data-meaning]'),
        example: document.querySelector('[data-example]'),
        synonyms: document.querySelector('[data-synonyms]'),
      },
    };

    // Props
    this.PROPS = {
      audio: null,
    };

    // Events
    this.DOM.form.input.addEventListener('input', this.onInput);
    this.DOM.form.self.addEventListener('submit', this.onSubmit);
    this.DOM.form.btn.addEventListener('click', this.onReset);
    this.DOM.result.speech.addEventListener('click', this.onSpeech);
    this.DOM.result.synonyms.addEventListener('click', this.onSynonymsClick);
  }

  /**
   * @function onSubmit - Form submit event handler
   * @param event
   */
  onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const word = Object.fromEntries(new FormData(form).entries()).word.trim();

    if (word.length === 0 || !word) {
      showNotification('warning', 'Please enter a word.');
      return;
    }

    this.fetchData(word);
  };

  /**
   * @function onReset - Reset form values
   */
  onReset = () => {
    this.DOM.form.self.reset();
    this.DOM.form.input.focus();
    this.DOM.form.btn.classList.add('hide');
    this.DOM.infoText.innerHTML = `Type any existing word and press enter to get meaning, example, synonyms, etc.`;
    this.DOM.result.self.classList.add('hide');
  };

  /**
   * @function onInput - Input change event handler
   * @param value
   */
  onInput = ({ target: { value } }) => {
    this.DOM.form.btn.className = `${value.trim().length !== 0 ? 'dictionary__reset' : 'dictionary__reset hide'}`;
  };

  /**
   * @function fetchData - Fetch data
   * @param term
   */
  fetchData = async (term) => {
    try {
      this.DOM.infoText.innerHTML = `Searching the meaning of <span class='h6'>"${term}"</span>`;
      const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`);
      const { phonetics, word, meanings } = data[0];

      this.DOM.result.self.classList.remove('hide');

      // Fill word section
      this.DOM.result.word.querySelector('span').innerHTML = `${word}`;
      this.DOM.result.word.querySelector('p').innerHTML = `${meanings[0].partOfSpeech}  /${phonetics[0]?.text}/`;

      // Fill meaning section
      this.DOM.result.meaning.querySelector('p').innerHTML = `${meanings[0].definitions[0].definition}.`;

      // Fill example section
      if (meanings[0].definitions[0].example === undefined) {
        this.DOM.result.example.classList.add('hide');
      } else {
        this.DOM.result.example.classList.remove('hide');
        this.DOM.result.example.querySelector('p').innerHTML = `${meanings[0].definitions[0].example}.`;
      }

      // Fill synonyms section
      if (meanings[0].synonyms.length !== 0) {
        this.DOM.result.synonyms.querySelector('ul').innerHTML = `${meanings[0].synonyms.map(i => `<li data-term='${i}'>${i}</li>`).join('')}`;
        this.DOM.result.synonyms.classList.remove('hide');
      } else {
        this.DOM.result.synonyms.classList.add('hide');
      }

      // Fill audio
      if (phonetics[0] !== undefined) {
        this.PROPS.audio = phonetics[0].audio === '' ? null : new Audio(phonetics[0].audio);
        this.PROPS.audio === null ? this.DOM.result.speech.classList.add('hide') : this.DOM.result.speech.classList.remove('hide');
      }
    } catch (e) {
      console.log(e);
      showNotification('danger', 'Something wrong, open console');
      this.DOM.infoText.innerHTML = `Can't find the meaning of <span>"${term}"</span>. Please, try to search for another word.`;
      this.DOM.result.self.classList.add('hide');
    }
  };

  /**
   * @function onSpeech - Speech word
   */
  onSpeech = () => {
    this.PROPS.audio.play();
  };

  /**
   * @function onSynonymsClick - Resend request
   * @param target
   */
  onSynonymsClick = ({ target }) => {
    if (target.matches('[data-term]')) {
      this.fetchData(target.dataset.term);
      this.DOM.form.input.value = target.dataset.term;
    }
  };
}

// ⚡️Class instance
new App();
