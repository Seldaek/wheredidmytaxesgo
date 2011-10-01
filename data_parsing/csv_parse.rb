# encoding: UTF-8

require 'csv'
require 'json'

rows = Hash.new do |h,k|
  h[k] = {
    'children' => []
  }
end

CSV.foreach('zuerich_laufende_rechnung_clean.csv', { :encoding => 'UTF-8', :headers => true} ) do |line|
  
  data = {}
  
  line.headers.each do |header|
    size = line[ header ]
  
    if size.nil? then
      size = 0
    end
    
    if size =~ /^[\-0-9\.]*$/ then
      size = size.to_f
    end

    data[ header ] = size
  end
  
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
