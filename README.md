# wbar

## Usage

Not yet usable :)

## Build

The best way to build wbar is with docker to ensure all dependencies are met. You might try to build without on a Linux system and maybe lucky. Run ``build.sh``. for repeated builds. For the first run you need to build the docker image itself:

```bash
# Build the build environment from Dockerfile
docker build -t wbar-build-env . 

# Build wbar.js and wbar.wasm: 
docker run -v "$PWD:/src" -it wbar-build-env bash 
make build/wbar.js 
```

