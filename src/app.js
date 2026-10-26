// Live search on directory pages: hides tables that don't match, and empty locations.
(function () {
  var input = document.querySelector('[data-filter]');
  if (!input) return;
  var empty = document.querySelector('.empty');
  input.addEventListener('input', function () {
    var words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    document.querySelectorAll('[data-group]').forEach(function (group) {
      var inGroup = 0;
      group.querySelectorAll('[data-search]').forEach(function (card) {
        var text = card.getAttribute('data-search');
        var hit = words.every(function (w) { return text.indexOf(w) !== -1; });
        card.hidden = !hit;
        if (hit) inGroup++;
      });
      group.hidden = inGroup === 0;
      shown += inGroup;
    });
    empty.hidden = shown > 0;
  });
})();
