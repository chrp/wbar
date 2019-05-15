#!/bin/bash

docker run -v "$PWD:/src" wbar-build-env make build/wbar.js
