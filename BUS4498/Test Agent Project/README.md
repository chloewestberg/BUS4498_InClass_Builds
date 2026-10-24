# Crate & Curious

A playful local icon sorter powered by Claude. Enter a keyword and Claude returns only the matching icon IDs in relevance order; the server validates those IDs against the local catalog before the browser displays anything.

## Run it

Ruby 2.6+ is enough—there are no packages to install:

```sh
ruby server.rb
```

Then open <http://127.0.0.1:4567>.

The server reads a Claude API key without exposing it to browser code. It looks for `api_keys/CLAUDE_API_KEY.txt`, `api_keys/claude.txt`, and matching `.txt` files. It also recognizes the existing `api keys/4498.txt` file in this project and extracts only the `sk-ant-...` token from plain text or RTF.

If no Claude key is available—or Claude cannot be reached—the UI stays usable with a clearly labeled local keyword-matching fallback. The fallback is deterministic and uses the icon names, descriptions, and tags.

## Claude connection

The server uses Anthropic's Messages API at `https://api.anthropic.com/v1/messages` with the `x-api-key` and `anthropic-version: 2023-06-01` headers. The configured model is `claude-sonnet-5-5`; change `CLAUDE_MODEL` in `server.rb` if you want to use another active Claude model. The request deliberately omits deprecated sampling parameters and asks Claude for a JSON array only.

## Files

- `index.html` — responsive interface and crate layout
- `styles.css` — dark playful visual system, wood texture, motion, and reduced-motion support
- `app.js` — catalog rendering, search states, animation, and ID filtering
- `server.rb` — static server, Claude request, key discovery, fallback, and server-side ID validation
- `icons.json` — local icon catalog with stable IDs and descriptions/tags
