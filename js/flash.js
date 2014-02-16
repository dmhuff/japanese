var VALUES = {
  /*kanji: { text: 'Kanji', tag: 'h1' },*/
  kana: { text: 'Kana', tag: 'h1' },
  romaji: { text: 'Rōmaji', tag: 'p' },
  english: { text: 'English', tag: 'p' }
};

var Flash = new function () {
  var self = this,
      deck = null;
  
  function Deck(options) {
    var self = this,
        vocabList = _.shuffle(options.vocab),
        cardIndex = 0,
        cardAnswer = false;
        
    this.nextCard = function () {
      console.log('asdfasdfasdfdsa ' + cardIndex);
      var card = null,
          questions = null,
          answers = null;
            
      if (cardAnswer) {
        // Move to the next card.
        
        console.log('next card, next');
        
        cardIndex++;
        updateProgress(cardIndex + 1);
        if (cardIndex === vocabList.length) {
          done();
          return;
        }
        
        /*questions = $('#card_div .card .question');
        answers = $('#card_div .card .answer');
        answers.css('display', 'none');
        
        card = vocabList[cardIndex];
        for (key in card) {
          questions.children('.card_text.' + key).text(card[key]);
          answers.children('.card_text.' + key).text(card[key]);
        }
        
        $('#card_div .card .question')
            .css('display', 'normal')
            .fadeIn();
        cardAnswer = false;*/
        
        renderCard(cardIndex);
      } else {
        // Display the answer.
        
        console.log('next card, answer');
        
        $('#card_div .card .answer').fadeIn();
        cardAnswer = true;
      }
    }
    
    function renderCard(index) {
      var card = vocabList[index],
          questions = $('#card_div .card .question'),
          answers = $('#card_div .card .answer');
          
      questions.hide();//.css('display', 'none');
      answers.hide();//.css('display', 'none');
      
      for (key in card) {
        questions.children('.card_text.' + key).text(card[key]);
        answers.children('.card_text.' + key).text(card[key]);
      }
      
      $('#card_div .card .question')
          //.css('display', 'normal')
          .fadeIn();
      cardAnswer = false;
    }
    
    function updateProgress(cardNumber) {
      $('#deck_progress .bar').css('width', 
          Math.round((cardNumber / options.vocab.length) * 100) + '%');
    }
    
    function done() {
      console.log('done');
      self.begin();
    }
        
    this.begin = function () {
      console.log('deck begin');
      var card = $('#card_div .card'),
          question_span = null;
          selector = '',
          type = '',
          tag = '',
          i = 0;
          
      cardIndex = 0;
      cardAnswer = false;
      
      card.find('.card_text').hide();//css('display', 'none');  
      for (i = 0; i < options.questions.length; i++) {
        type = options.questions[i];
        tag = VALUES[type].tag
        $('.question').append('<' + tag + ' class="card_text ' + type + '">&nbsp;</' + tag + '/>');
        // selector = '.question .card_text.' + options.questions[i].toLowerCase();
        // console.log('[' + selector + '] found ' + card.find(selector));
        // card.find(selector).css('display', 'normal');
      }
      for (i = 0; i < options.answers.length; i++) {
        type = options.answers[i];
        tag = VALUES[options.answers[i]].tag
        $('.answer').append('<' + tag + ' class="card_text ' + type + '">&nbsp;</' + tag + '/>');
        // selector = '.answer .card_text.' + options.answers[i].toLowerCase();
        // console.log('[' + selector + '] found ' + card.find(selector));
        // card.find(selector).css('display', 'normal');
      }
      $('#card_div .card').unbind('click').click(self.nextCard);
      
      
      $('#setup_div').hide();//css('display', 'none');  
      $('.answer').hide();//css('display', 'none');  
      renderCard(0);
      $('#card_div').fadeIn();
      //$('#deck_progress .bar').css('width', '0%');
      updateProgress(1);
      $('#deck_progress').fadeIn();
      
    };
  }
  
  function getButtonSelections(selector) {
    return $(selector).children('button.active').map(
        function () { return this.value; });
  }
  
  this.getOptions = function () {
    var cardSet = $('#input_cart_set').val();
        options = { 
          questions: getButtonSelections('#form_setup #input_question'),
          answers: getButtonSelections('#form_setup #input_answer'),
          vocab: VOCAB_LIST
        };
        
    // Validate the options.
    if (options.questions.size() === 0) {
      alert('You must choose at least one question option.');
      return null;
    }
    if (options.answers.size() === 0) {
      alert('You must choose at least one answer option.');
      return null;
    }
    
    // Limit the vocab list to a set of cards matching the selected tag.
    if (typeof cardSet !== 'undefined' && cardSet !== 'all') {
      options.vocab = _.select(VOCAB_LIST, function (v) { 
        return v.tags.split(/,\s*/).indexOf(cardSet) >= 0; 
      });
    }
    
    return options;
  };
  
  this.begin = function () {
    console.log('flash begin');
    var options = self.getOptions();
    if (options !== null) {
      deck = new Deck(options);
      deck.begin();
    }
  };
  
  this.reset = function () {
    deck = null;
    $('#card_div').hide();
    $('#deck_progress').fadeOut();
    $('#setup_div').fadeIn();
  };
  
  this.fillButtonGroup = function (groupSelector, data, onclick) {
    var group = $(groupSelector),
        key = '';
    
    for (key in data) {
      group.append('<button type="button" class="btn" value="' + key + '">'
          + data[key].text + '</button>'); 
    }
    if (typeof onclick !== 'undefined') {
      group.find('button').click(onclick);
    }
    group.button();
  };
  
  this.fillCardSet = function () {
    var select = $('select#input_cart_set'),
        tags = _.uniq(_.flatten(_.map(VOCAB_LIST, function (w) { return w.tags.split(/,\s*/); } ))).sort();
    
    _.each(tags, function (t) {
      select.append('<option value="' + t + '">' + t.capitalize() + '</option>');
    });
  };
  
  this.getDeck = function () {
    return deck;
  };
}();

$(function () {
  // Setup Form.
  // $('#form_setup #input_question').button();
  // $('#form_setup #input_answer').button();
  Flash.fillButtonGroup('#form_setup #input_question', VALUES);
  Flash.fillButtonGroup('#form_setup #input_answer', VALUES);
  Flash.fillCardSet();
	//$('#deck_size_slider').slider();
  
  $('#reset_button').click(Flash.reset);
  $('#start_button').click(Flash.begin);
  // $('#autoplay_button').button().bind('click', function () {
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
});
