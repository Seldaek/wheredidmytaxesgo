# encoding: UTF-8

require 'csv'
require 'json'

rows = Hash.new do |h,k|
  h[k] = []
end

CSV.foreach('zuerich_laufende_rechnung_clean.csv', { :encoding => 'UTF-8', :headers => true} ) do |line|
  data = {}
  line.headers.each do |h|
    data[ h ] = line[ h ]
  end
  
  rows[ line['Kategorie'] ] << data
end

puts JSON.pretty_generate( rows )