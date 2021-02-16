FROM node:15-alpine


# set the timezone
RUN apk install tzdata
ENV TZ="America/Los_Angeles"
RUN ls /usr/share/zoneinfo && \
  cp /usr/share/zoneinfo/America/Los_Angeles /etc/localtime && \
  echo "America/Los_Angeles" > /etc/timezone


# This hack invalidates the cache (see https://github.com/caprover/caprover/issues/381)
# This is done so `yarn install` is phresh every time the image is built.
ADD https://www.google.com /time.now


# install the tweetbot
WORKDIR /tweetbot
COPY . .
RUN yarn install

CMD [ "yarn", "run", "start" ]
