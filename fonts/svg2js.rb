# encoding: UTF-8

require 'awesome_print'
require 'json'

fonts = {}
svgbegin = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'
svgend   = '</svg>'

#File.open("mplus_stroke.svg", mode = "rt"){|f|
File.open("mplus_stroke.svg", mode = "rt"){|f|
  xml = f.gets
  svg = f.gets
  while l = f.gets do 
      if mo = l.match(/UTF8:([abcde0-9]{6})/)
        utfbytes=mo[1]
        char = [utfbytes].pack("H*").force_encoding("UTF-8")

        path = f.gets.chomp
        fonts[char] = svgbegin + path + svgend
        puts fonts[char]
        exit
      end
  end
}

puts "const fontSVGs = #{fonts.to_json}"
puts ""
puts "module.exports = fontSVGs"
