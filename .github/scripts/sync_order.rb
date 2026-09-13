require 'yaml'
require 'date'

Encoding.default_external = Encoding::UTF_8

ORDER_PATH = '_data/order.yml'

def key_of(item)
  [item['type'].to_s, item['post'].to_s]
end

def sortable_date(value)
  value.respond_to?(:strftime) ? value.strftime('%Y-%m-%dT%H:%M:%S') : value.to_s
end

members = YAML.load_file('_config.yml')['members'].map { |m| m['key'] }

posts = members.flat_map do |dir|
  Dir.glob(File.join(dir, '*.md')).map do |file|
    front = File.read(file)[/\A---\s*\n(.*?)\n---/m, 1]
    meta = front && YAML.safe_load(front, permitted_classes: [Date, Time])
    next unless meta.is_a?(Hash) && meta['title']

    { 'type' => dir, 'post' => File.basename(file, '.md'), 'date' => sortable_date(meta['date']) }
  end.compact
end

current = File.exist?(ORDER_PATH) ? (YAML.load_file(ORDER_PATH) || {})['posts'] || [] : []
existing = posts.map { |p| key_of(p) }

kept = current.select { |item| existing.include?(key_of(item)) }.uniq { |item| key_of(item) }
listed = kept.map { |item| key_of(item) }
added = posts.reject { |p| listed.include?(key_of(p)) }.sort_by { |p| p['date'] }.reverse

updated = (added + kept).map { |item| { 'type' => item['type'].to_s, 'post' => item['post'].to_s } }

if updated == current
  puts 'order.yml is already up to date'
else
  File.write(ORDER_PATH, { 'posts' => updated }.to_yaml(line_width: -1).sub(/\A---\n/, ''))
  puts "added #{added.size}, removed #{current.size - kept.size}"
end
