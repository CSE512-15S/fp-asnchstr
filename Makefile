
all:

deps:
	cd herbie && git submodule init && git submodule update

run:
	racket herbie/herbie/herbie-web/server.rkt ../page/herbie-web.js ../page/style.css
