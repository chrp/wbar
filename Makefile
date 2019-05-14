

build/wbar.js: clean .emmake wbar.c
	rm -rf build
	mkdir build
	emcc wbar.c zbar-src/zbar/.libs/libzbar.a \
	  -o build/wbar.js \
	  -I zbar-src/include/ \
	  -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
	  -Wunused-function

.emmake: zbar-src/Makefile
	cd zbar-src && emmake make

zbar-src/Makefile: zbar-src
	cd zbar-src \
	&& sed -i -e 's/ -Werror//g' configure.ac \
	&& autoreconf -i \
	&& emconfigure ./configure --without-x --without-jpeg \
		--without-imagemagick --without-npapi --without-gtk \
		--without-python --without-qt --without-xshm --disable-video \
		--disable-pthread

zbar-src:
	git clone https://github.com/ZBar/ZBar.git zbar-src --depth 1

clean:
	rm -rf build
