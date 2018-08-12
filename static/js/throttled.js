

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// only calls fn every delay milliseconds, schedules debounce if function isn't called
function throttled(delay, fn) {
  let lastCall = 0;
  let debounced = debounce(fn, delay);
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
        debounced(...args) // if throttled schedule a final update
        return;
    }
    lastCall = now;
    return fn(...args);
  }
}