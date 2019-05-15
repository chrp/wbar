FROM trzeci/emscripten

# Install requirements for building zbar & clear apt cache to keep img smaller
RUN apt-get update -yqq \
  && apt-get install -yqq --no-install-recommends automake autoconf \
    libtool gettext autogen imagemagick libmagickcore-dev \
  && rm -rf /var/lib/apt/lists

COPY . /src/
