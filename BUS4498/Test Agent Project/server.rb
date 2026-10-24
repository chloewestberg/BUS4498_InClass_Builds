#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "net/http"
require "uri"
require "webrick"

ROOT = File.expand_path(__dir__)
PORT = Integer(ENV.fetch("PORT", "4567"))
CLAUDE_MODEL = "claude-sonnet-5-5"
ANTHROPIC_ENDPOINT = URI("https://api.anthropic.com/v1/messages")

def icon_catalog
  JSON.parse(File.read(File.join(ROOT, "icons.json")))
end

def api_key_candidates
  explicit = [
    File.join(ROOT, "api_keys", "CLAUDE_API_KEY.txt"),
    File.join(ROOT, "api_keys", "claude.txt"),
    File.join(ROOT, "api keys", "CLAUDE_API_KEY.txt"),
    File.join(ROOT, "api keys", "claude.txt"),
    File.join(ROOT, "api keys", "4498.txt")
  ]
  discovered = [Dir[File.join(ROOT, "api_keys", "*.txt")], Dir[File.join(ROOT, "api keys", "*.txt")]].flatten
  (explicit + discovered).uniq.select { |path| File.file?(path) }
end

def read_claude_key
  api_key_candidates.each do |path|
    raw = File.binread(path).force_encoding("UTF-8")
    match = raw.match(/sk-ant-[A-Za-z0-9_-]+/)
    return match[0] if match
  rescue StandardError
    next
  end
  nil
end

def local_matches(keyword, catalog)
  query = keyword.downcase.strip
  scored = catalog.map do |icon|
    haystack = [icon["name"], icon["description"], *(icon["tags"] || [])].join(" ").downcase
    words = query.split(/\s+/).reject(&:empty?)
    score = words.sum do |word|
      next 0 unless haystack.include?(word)
      icon["name"].downcase.include?(word) ? 3 : (icon["tags"].any? { |tag| tag.downcase.include?(word) } ? 2 : 1)
    end
    [icon["id"], score]
  end
  scored.select { |_, score| score.positive? }.sort_by { |id, score| [-score, id] }.map(&:first)
end

def safe_error_response(message, status = 500)
  [status, { "Content-Type" => "application/json; charset=utf-8" }, JSON.generate({ error: message })]
end

def ask_claude(keyword, catalog, api_key)
  icon_lines = catalog.map { |icon| "- #{icon["id"]}: #{icon["description"]} Tags: #{(icon["tags"] || []).join(", ")}" }.join("\n")
  prompt = <<~PROMPT
    You sort a fixed catalog of cute icons by relevance.
    Keyword: #{keyword.inspect}

    Catalog:
    #{icon_lines}

    Return only a JSON array of matching icon IDs in descending relevance order.
    Include only IDs from the catalog. Return [] when nothing matches. Do not include markdown, explanations, or any other text.
  PROMPT
  request_body = {
    model: CLAUDE_MODEL,
    max_tokens: 256,
    system: "You are a precise relevance sorter. Follow the requested output format exactly.",
    messages: [{ role: "user", content: prompt }]
  }
  request = Net::HTTP::Post.new(ANTHROPIC_ENDPOINT)
  request["content-type"] = "application/json"
  request["accept"] = "application/json"
  request["x-api-key"] = api_key
  request["anthropic-version"] = "2023-06-01"
  request.body = JSON.generate(request_body)
  http = Net::HTTP.new(ANTHROPIC_ENDPOINT.host, ANTHROPIC_ENDPOINT.port)
  http.use_ssl = true
  http.open_timeout = 8
  http.read_timeout = 20
  response = http.request(request)
  unless response.is_a?(Net::HTTPSuccess)
    raise "Claude request failed"
  end
  payload = JSON.parse(response.body)
  text = Array(payload["content"]).select { |block| block["type"] == "text" }.map { |block| block["text"] }.join.strip
  json_text = text[/\[[\s\S]*\]/]
  raise "Claude returned an invalid sort" unless json_text
  ids = JSON.parse(json_text)
  raise "Claude returned an invalid sort" unless ids.is_a?(Array) && ids.all? { |id| id.is_a?(String) }
  ids
end

class AppServlet < WEBrick::HTTPServlet::AbstractServlet
  def do_GET(request, response)
    path = request.path == "/" ? "/index.html" : request.path
    file = File.expand_path(path.sub(%r{\A/}, ""), ROOT)
    unless file.start_with?(ROOT) && File.file?(file)
      response.status = 404
      response["Content-Type"] = "text/plain; charset=utf-8"
      response.body = "Not found"
      return
    end
    response.status = 200
    response["Content-Type"] = content_type(file)
    response["Cache-Control"] = "no-store"
    response.body = File.binread(file)
  end

  def do_POST(request, response)
    unless request.path == "/api/search"
      response.status, response["Content-Type"], response.body = safe_error_response("Not found", 404)
      return
    end
    input = JSON.parse(request.body.to_s)
    keyword = input["keyword"].to_s.strip[0, 80]
    raise "Keyword is required" if keyword.empty?
    catalog = icon_catalog
    allowed = catalog.map { |icon| icon["id"] }
    key = read_claude_key
    if key.nil?
      ids = local_matches(keyword, catalog)
      body = { ids: ids, mode: "fallback", message: "Claude is not configured yet — showing local keyword matching." }
    else
      begin
        raw_ids = ask_claude(keyword, catalog, key)
        ids = raw_ids.select { |id| allowed.include?(id) }.uniq
        body = { ids: ids, mode: "claude", model: CLAUDE_MODEL }
      rescue StandardError
        ids = local_matches(keyword, catalog)
        body = { ids: ids, mode: "fallback", error: true, message: "Claude could not sort this time — showing local keyword matching instead." }
      end
    end
    response.status = 200
    response["Content-Type"] = "application/json; charset=utf-8"
    response["Cache-Control"] = "no-store"
    response.body = JSON.generate(body)
  rescue JSON::ParserError
    response.status, response["Content-Type"], response.body = safe_error_response("Please send a valid search request.", 400)
  rescue StandardError
    response.status, response["Content-Type"], response.body = safe_error_response("The local server could not process that search.", 400)
  end

  private

  def content_type(file)
    { ".html" => "text/html; charset=utf-8", ".css" => "text/css; charset=utf-8", ".js" => "application/javascript; charset=utf-8", ".json" => "application/json; charset=utf-8" }[File.extname(file)] || "application/octet-stream"
  end
end

server = WEBrick::HTTPServer.new(Port: PORT, BindAddress: "127.0.0.1", AccessLog: [], Logger: WEBrick::Log.new(File::NULL, WEBrick::BasicLog::WARN))
server.mount("/", AppServlet)
trap("INT") { server.shutdown }
puts "Crate & Curious is running at http://127.0.0.1:#{PORT}"
server.start
