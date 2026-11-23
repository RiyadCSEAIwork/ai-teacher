/**
 * AI Teacher - small UI tweak
 * Moves the image-upload button from the left of the input box to the right,
 * right next to the mic (voice) button: [ text ... ] [mic] [image] [ask]
 * script.js and voice.js are NOT changed. The upload button keeps its
 * existing id/listener, only its position moves.
 */
(function () {
  function place() {
    var row = document.querySelector('.input-main-row');
    var label = row && row.querySelector('.btn-upload-image');
    var submit = document.getElementById('btnSubmitQuestion');
    if (!row || !label || !submit || submit.parentNode !== row) return;
    // already directly before the Ask button (i.e. right after the mic)
    if (label.nextElementSibling === submit) return;
    row.insertBefore(label, submit);
  }

  function init() {
    place();
    var row = document.querySelector('.input-main-row');
    if (!row) return;
    // voice.js adds the mic a moment later; keep the image button right after it
    var obs = new MutationObserver(place);
    obs.observe(row, { childList: true });
    setTimeout(place, 500);
    setTimeout(place, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
