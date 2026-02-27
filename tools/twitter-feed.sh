#!/bin/bash
# Twitter/X Feed Scraper — uses vxtwitter API (no auth needed)
# Usage: ./twitter-feed.sh <handle> [count]
#        ./twitter-feed.sh --tweet <tweet_id>
#
# Methods (in priority order):
# 1. api.vxtwitter.com — JSON API, returns full tweet text + media URLs
# 2. syndication.twitter.com — timeline profile (rate limited, no auth)
#
# Saved: 2026-02-14. Works as of this date.

HANDLE="${1}"
COUNT="${2:-10}"

if [ "$1" = "--tweet" ]; then
  # Fetch single tweet by ID
  TWEET_ID="$2"
  if [ -z "$TWEET_ID" ]; then echo "Usage: $0 --tweet <tweet_id>"; exit 1; fi
  # We need the handle too, but vxtwitter can resolve without it
  # Try with a placeholder — vxtwitter redirects
  curl -sL "https://api.vxtwitter.com/x/status/${TWEET_ID}" 2>/dev/null | python3 -m json.tool
  exit $?
fi

if [ -z "$HANDLE" ]; then
  echo "Usage: $0 <handle> [count]"
  echo "       $0 --tweet <tweet_id>"
  exit 1
fi

echo "=== @${HANDLE} recent tweets ==="
echo ""

# Method 1: syndication API (returns HTML, needs parsing)
curl -s "https://syndication.twitter.com/srv/timeline-profile/screen-name/${HANDLE}" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  2>/dev/null | python3 -c "
import sys, re, html
content = sys.stdin.read()
# Extract tweet text from timeline HTML
tweets = re.findall(r'data-tweet-id=\"(\d+)\".*?<p[^>]*>(.*?)</p>', content, re.DOTALL)
if not tweets:
    # Fallback: try finding text in different format
    texts = re.findall(r'\"full_text\":\"(.*?)\"', content)
    for i, t in enumerate(texts[:${COUNT}]):
        t = t.encode().decode('unicode_escape')
        print(f'{i+1}. {t}')
        print()
else:
    for i, (tid, text) in enumerate(tweets[:${COUNT}]):
        text = html.unescape(re.sub(r'<[^>]+>', '', text)).strip()
        print(f'{i+1}. [{tid}] {text}')
        print()
" 2>/dev/null

if [ $? -ne 0 ] || [ -z "$(curl -s "https://syndication.twitter.com/srv/timeline-profile/screen-name/${HANDLE}" -H "User-Agent: Mozilla/5.0" 2>/dev/null | head -1)" ]; then
  echo "(syndication API rate limited or unavailable)"
fi
