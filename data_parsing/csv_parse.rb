# encoding: UTF-8

require 'csv'
require 'json'

rows = Hash.new do |h,k|
  h[k] = {
    'children' => []
  }
end

CSV.foreach('zuerich_laufende_rechnung_clean.csv', { :encoding => 'UTF-8', :headers => true} ) do |line|
  size = line['Aufwand total']
  
  if size.nil? then
    size = 0
  end
  
  data = {
    'name' => line['Aufgaben'],
    'size' => size.to_i
  }

  rows[ line['Kategorie'] ]['name'] = line['Kategorie']
  rows[ line['Kategorie'] ]['children'] << data
  
end

final = {
  'name' => 'ZH',
  'children' => []
}

rows.each_pair do |key, value|
  final['children'] << value
end

puts JSON.pretty_generate( final )