# wbar - zbar on Web Assembly

This is a playground project aimed at finding out how C, Web Assembly and JS play together. Not suitable for anyone else.

## Usage

Not yet usable :) Don't use for production.

## Build

The best way to build wbar is with docker to ensure all dependencies are met. You might try to build without on a Linux system and maybe lucky. Run ``build.sh``. for repeated builds. For the first run you need to build the docker image itself:

```bash
# Build the build environment from Dockerfile
docker build -t wbar-build-env . 

# Build wbar.js and wbar.wasm: 
docker run -v "$PWD:/src" -it wbar-build-env bash 
make build/wbar.js 
```

## Sources

This is where we got ideas & code from: 

- [Barkey Wolf Consulting: Using the ZBar barcode scanning suite in the browser with WebAssembly](https://barkeywolf.consulting/posts/barcode-scanner-webassembly/)
- [samsam2310/zbar.wasm](https://github.com/samsam2310/zbar.wasm)
- [zbar API](http://zbar.sourceforge.net/api/)
