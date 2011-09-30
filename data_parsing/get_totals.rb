# encoding: UTF-8

require 'csv'
require 'json'

rows = Hash.new do |h,k|
  h[k] = 0
end

CSV.foreach('zuerich_laufende_rechnung_clean.csv', { :encoding => 'UTF-8', :headers => true} ) do |line|
  rows[ line['Kategorie'] ] += line["Aufwand total"].to_i
end

puts JSON.pretty_generate( rows )