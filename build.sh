#!/bin/bash

docker run --rm -v "$PWD:/src" wbar-build-env make build/wbar.js
