# tweetbot
Every day, tweet a random eBay item along with rover link

### fly.io usage

put secrets from .env into flyctl

   cat .env | flyctl secrets import

**Important!** secrets in .env must not have double quotes around them! flyctl will take those quotes literally!