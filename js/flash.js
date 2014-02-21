/** Flash app singleton. */
var Flash = new function () {
  var self = this,
      deck = null;

  /** Lookup object for vocab key values. */
  self.VALUES = {
    kanji:   { text: 'Kanji',   tag: 'h1' },
    kana:    { text: 'Kana',    tag: 'h2' },
    romaji:  { text: 'Rōmaji',  tag: 'p' },
    english: { text: 'English', tag: 'p' }
  };

  /**
   * A deck of flash cards.
   * @constructor
   * @params {Object} options - Configuration options.
   */
  function Deck(options) {
    var self = this,
        vocabList = _.shuffle(options.vocab),
        cardIndex = 0,
        cardAnswer = false;

    /** Display the next card in the deck. */
    this.nextCard = function () {
      console.log('nextCard() - card index ' + cardIndex);
      var card = null,
          questions = null,
          answers = null;

      if (cardAnswer) {
        // Display the next card.
        console.debug('next card, next');

        cardIndex++;
        updateProgress(cardIndex);
        if (cardIndex === vocabList.length) {
          done();
          return;
        }
        renderCard(cardIndex);
      } else {
        // Display the answer.
        console.debug('next card, answer');

        $('#card_div .card .answer').fadeIn();
        cardAnswer = true;
      }
    }

    /**
     * Draw a card on the screen.
     * @param {Number} index - The index of the displayed card in the deck.
     */
    function renderCard(index) {
      var card = vocabList[index],
          questions = $('#card_div .card .question'),
          answers = $('#card_div .card .answer');

      questions.hide();
      answers.hide();

      for (key in card) {
        questions.children('.card_text.' + key).text(card[key]);
        answers.children('.card_text.' + key).text(card[key]);
      }

      $('#card_div .card .question').fadeIn();
      cardAnswer = false;
    }

    /**
     * Update the UI progress indicator to match the player's current position
     * in the deck.
     * @param {Number} cardIndex - The current card's index.
     */
    function updateProgress(cardIndex) {
      $('#deck_progress .bar').css('width',
          Math.round(((cardIndex + 1) / options.vocab.length) * 100) + '%');
    }

    /** End the current study session. */
    function done() {
      console.debug('done');
      self.begin();
    }

    /** Start the study session. */
    this.begin = function () {
      console.debug('deck begin');
      var card = $('#card_div .card'),
          question_span = null;
          selector = '',
          type = '',
          tag = '',
          i = 0;

      cardIndex = 0;
      cardAnswer = false;

      card.find('.card_text').hide();
      for (i = 0; i < options.questions.length; i++) {
        type = options.questions[i];
        tag = Flash.VALUES[type].tag // HACK derive values from card list, not constant
        // TODO implement helper method for creating HTML for card text.
        $('.question').append('<' + tag + ' class="card_text ' + type + '">&nbsp;</' + tag + '/>');
      }
      for (i = 0; i < options.answers.length; i++) {
        type = options.answers[i];
        tag = Flash.VALUES[options.answers[i]].tag
        $('.answer').append('<' + tag + ' class="card_text ' + type + '">&nbsp;</' + tag + '/>');
      }
      $('#card_div .card').unbind('click').click(self.nextCard);


      $('#setup_div').hide();
      $('.answer').hide();
      renderCard(0);
      $('#card_div').fadeIn();
      updateProgress(0);
      $('#deck_progress').fadeIn();
    };
  }

  /**
   * Query the DOM to retrieve the user's selection for a button set.
   * @param {String} selector - jQuery selector for the button set.
   * @returns {Array} the user's selection(s).
   */
  function getButtonSelections(selector) {
    var selectedButtons = $(selector).children('button.active'),
        selections = [];

    for (var i = 0; i < selectedButtons.length; i++) {
      selections.push(selectedButtons[i].value);
    }
    return selections;

    // return $(selector).children('button.active').map(
        // function () { return this.value; });
  }

  /**
   * Query the DOM to get the user's selected options for a study session.
   * @returns {Object} The user's selections.
   */
  this.getOptions = function (cardList) {
    var cardSet = $('#input_cart_set').val();
        options = {
          questions: getButtonSelections('#form_setup #input_question'),
          answers: getButtonSelections('#form_setup #input_answer')
        };

    // Validate the options.
    if (options.questions.length === 0) {
      alert('You must choose at least one question option.');
      return null;
    }
    if (options.answers.length === 0) {
      alert('You must choose at least one answer option.');
      return null;
    }

    // Limit the vocab list to a set of cards matching the selected tag.
    if (typeof cardSet !== 'undefined' && cardSet !== 'all') {
      options.vocab = _.select(cardList, function (v) {
        return v.tags.split(/;\s*/).indexOf(cardSet) >= 0; // TODO extract regex to constant (it's used elswhere).
      });
    } else {
      options.vocab = cardList;
    }

    return options;
  };

  /** Begin a study session. */
  this.begin = function (cardList) {
    console.debug('flash begin');
    var options = self.getOptions(cardList);
    if (options !== null) {
      deck = new Deck(options);
      deck.begin();
    }
  };

  /** Return the user to the main menu. */
  this.reset = function () {
    deck = null;
    $('#card_div').hide();
    $('#deck_progress').fadeOut();
    $('#setup_div').fadeIn();
  };

  /**
   * Utility method; fill a button group with a set of options and behavior.
   * @param groupSelector - jQuery selector for the button group.
   * @param options - Object with data about options for the group.
   * @param onclick - Optional event handler funtion for click events.
   */
  this.fillButtonGroup = function (groupSelector, options, onclick) {
    var group = $(groupSelector),
        key = '';

    for (key in options) {
      group.append('<button type="button" class="btn" value="' + key + '">'
          + options[key].text + '</button>');
    }
    if (typeof onclick !== 'undefined') {
      group.find('button').click(onclick);
    }
    group.button();
  };

  /** Fill the cart set UI select control with options. */
  this.fillCardSet = function (cardList) {
    var select = $('select#input_cart_set'),
        tags = _.uniq(_.flatten(_.map(cardList, function (w) { return w.tags.split(/;\s*/); } ))).sort();

    _.each(tags, function (t) {
      select.append('<option value="' + t + '">' + t.capitalize() + '</option>');
    });
  };

  /** @returns The current flash card deck. */
  this.getDeck = function () {
    return deck;
  };
}();

// Kick off the app!
$(function () {
  /**
   * Configure and start the app.
   * @param {Array} cardList - An array of flash card objects.
   */
  function startApp(cardList) {
    // Setup the header.
    $('#reset_button').click(Flash.reset);
    $('#start_button').click(function () { Flash.begin(cardList); }); // HACK fix how card list is passed to deck object.
    $('body').on('click', '#autoplay_button', function () {
      if ($(this).hasClass('active')) {
        this.__timeout = setInterval(function () {
          try {
            Flash.getDeck().nextCard();
          } catch (e) {}
        }, 5000);
      } else {
        clearInterval(this.__timeout);
      }
    });

    // Setup the form.
    Flash.fillButtonGroup('#form_setup #input_question', Flash.VALUES);
    Flash.fillButtonGroup('#form_setup #input_answer', Flash.VALUES);
    Flash.fillCardSet(cardList);
  }

  // Load the vocab list and start the app.
  $.getJSON('data/vocab.json', startApp);
});
