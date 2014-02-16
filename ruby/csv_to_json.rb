#!/usr/bin/env ruby

require 'pp'
require 'csv'

require 'json'

DEFAULT_OUTPUT_JSON_FILE = '../data/vocab.json'

# Read and validate the command line arguments.
input_csv_file, output_json_file = *ARGV
if [nil, '-h', '--help'].include?(input_csv_file)
  STDERR.puts "Usage: #{$0} input_csv_file [output_json_file]",
              '  input_csv_file: path to CSV input data file',
              '  output_json_file: optional path to JSON output data file,',
              "                    defaults to #{DEFAULT_OUTPUT_JSON_FILE}"
  exit(-1)
end
output_json_file ||= DEFAULT_OUTPUT_JSON_FILE

puts "Parsing #{input_csv_file} ..."

# Read the CSV file (use File.read to work around UTF8 issue with CSV.read).
rows = CSV.parse(File.read(input_csv_file))

# Consider the first row to be column headers, and use the values as keys.
keys = rows.shift.compact!.map! { |k| k.downcase }

data = rows.map do |row|
  next if row.compact.empty?

  hash = Hash.new
  keys.each_with_index { |key, i| hash[key] = row[i] }
  hash
end
data.compact!

puts "Writing #{output_json_file} ..."

open(output_json_file, 'w') { |f| f.puts(data.to_json) }

puts 'Done.'
