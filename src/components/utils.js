var URL = require('url');

module.exports = {
  /**
   * Skip opening the link through Facebook.
   */
  skipFacebookRedirect: function(url) {
    var parsed = URL.parse(url, true);
    var hostMatches = parsed.hostname.indexOf('facebook.com') > -1 || parsed.hostname.indexOf('messenger.com') > -1;
    var pathMatches = parsed.pathname.indexOf('/l.php') > -1;

    if (hostMatches && pathMatches && parsed.query.u) {
      url = decodeURIComponent(parsed.query.u);
    }

    return url;
  },
  /**
   * Reload when computer wakes up.
   * Tracks time difference, if the difference is greater than 3 minutes. The window reloads.
   * If we know how long Messenger's session takes to timeout, perhaps use that time instead?
   * 
   * Notes:
   *   V8 caches date information, the current minute is updated at most, once per minute.
   *   This means if the system time jumps, it might take up to a minute before the time is
   *   represented by new Date().
   *
   *   It is unknown how often the hour is updated, but assumed that it is checked also once
   *   per minute and not cached for longer. 
   *
   *   The absolute local time difference is tracked, this will cause MFD to reload when you
   *   cross timezones also. This may or may not be desired, and could be fixed using
   *   getTimezoneOffset(), or using UTC time.
   *
   *   Although it's unlikely that the time will result in a reload more than once a minute
   *   due to time caching, it's possible that the bug/feature might be resolved in the future.
   *   It's because of that motivation that the timeout remains at once per second. If the time
   *   is cached, there is no performance impact, and if in the future it isn't cached. We can
   *   profile and fix it at a later time. Overall a quick refresh means we reload as fast as
   *   V8 will let us.
   */
  watchComputerWake: function(win, winBehaviour, document) {
    var time = new Date().getTime();
    setInterval(function() {
      var currentTime = new Date().getTime();
      var deltaTime = Math.abs(currentTime - time);
      if (deltaTime > 60000 * 3) {  // Time in ms. 3 minutes.
		// Remove the iframe to prevent interaction on an old session.
		document.querySelector('iframe').remove();
        // Save the window state and reload.
        winBehaviour.saveWindowState(win);
        win.reload();
        /**
         * Rerun the online check.
         * We might have changed locations and no longer have internet access
         */
        this.checkForOnline(win);
      }
	  time = currentTime;
    }, 1000);
  },
  /**
   * Reloads the app once every 10 seconds until the browser is in online mode.
   */
  checkForOnline: function(win) {
    var reloadIntervalId = setInterval(function() {
      if (win.window.navigator.onLine) {
        clearInterval(reloadIntervalId);
      } else {
        win.reload();
      }
    }, 10 * 1000);
  },
  /**
   * Climbs the prototype hierachy looking for the top Object and returns it
   */
  getRootObject: function(object) {
	  while(object.__proto__) {
		  object = object.__proto__;
	  }
	  return object;
  },
  /**
   * Checks if two objects exist in the same context.
   * Climbs up to the root Object(){} and checks if the constructors are 
   * identical. If they are not, it's a separate global context 
   */
  areSameContext: function(object1, object2) {
	  root1 = this.getRootObject(object1);
	  root2 = this.getRootObject(object2);
	  return root1.constructor == root2.constructor;
  }
};