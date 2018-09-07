
all:

deps:
	cd herbie && git submodule init && git submodule update

run:
	racket herbie/www/viz/viz-server.rkt ../page/herbie-web.js ../page/style.css
