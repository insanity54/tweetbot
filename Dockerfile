FROM node:15-alpine

# this hack invalidates the cache (see https://github.com/caprover/caprover/issues/381)
ADD https://www.google.com /time.now


WORKDIR /tweetbot
COPY . .
RUN yarn install

CMD [ "yarn", "run", "start" ]
