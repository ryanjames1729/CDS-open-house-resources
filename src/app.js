// Directory pages: filter tables by topic button and by search words.
// A search word of 3+ letters matches the start of any word on the card or in its hidden
// keywords ("bio" → biology, "chem" → chemistry). Shorter words ("AP") and plurals
// ("classes" → class) must match a whole word.
(function () {
  var input = document.querySelector('[data-filter]');
  if (!input) return;
  var empty = document.querySelector('.empty');
  var topicButtons = document.querySelectorAll('[data-topic]');
  var topic = '';

  function stem(w) { return w.length > 3 ? w.replace(/(es|s)$/, '') : w; }
  function words(text) { return text.toLowerCase().split(/[^a-z0-9ñáéíóú]+/).filter(Boolean); }

  var cards = Array.prototype.map.call(document.querySelectorAll('[data-search]'), function (card) {
    var text = card.getAttribute('data-search');
    return { el: card, text: text, words: words(text), topics: (card.getAttribute('data-topics') || '').split(' ') };
  });

  function matches(card, query) {
    return query.every(function (q) {
      var s = stem(q);
      return card.words.some(function (w) { return w === q || stem(w) === s || (q.length >= 3 && w.indexOf(q) === 0); });
    }) || (query.length > 1 && card.text.indexOf(query.join(' ')) !== -1);
  }

  function apply() {
    var query = words(input.value);
    var shown = 0;
    cards.forEach(function (card) {
      var hit = (!topic || card.topics.indexOf(topic) !== -1) && matches(card, query);
      card.el.hidden = !hit;
      if (hit) shown++;
    });
    document.querySelectorAll('[data-group]').forEach(function (group) {
      group.hidden = !group.querySelector('[data-search]:not([hidden])');
    });
    empty.hidden = shown > 0;
  }

  input.addEventListener('input', apply);
  topicButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      topic = btn.getAttribute('data-topic');
      topicButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      apply();
    });
  });
})();
