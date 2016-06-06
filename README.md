# sipopama
Simple Portable Password Manager

Clearly this is a work in progress.  However, it does 2 things:

  1. it takes a user supplied password and does proper salted key derivation, lik e you would hope a website was doing
  2. it takes the derived key, and transforms it into a more friendly representation to supply to a webpage

This allows you you have unique passwords per site.  This overall is
very similaqr to Alan Karp's "Site Password" (see
http://shiftleft.com/mirrors/www.hpl.hp.com/personal/Alan_Karp/site_password/index.html),
but updated for more modern crypto and UI.


For defaults, the scrypt choices are good.  The "rounds" parameter is
really "p"; the other scrypt paramaters are for now fixed (but at
pretty sensible defaults).  I wouldn't recommend going much above 5.

If you really want PBKDF2, set rounds much higher (4K is a *minimum*)

Installation
------------

Drop the files in a directory; open interface.html with Firefox.
Alternatively, put them on a webserver somewhere and you should get
broader cross-browser compatability (right now the scrypt routines
make Chrome unhappy if you use it purely locally, as do the saved
salts loading routine; see
https://bugs.chromium.org/p/chromium/issues/detail?id=47416 for more
info).

