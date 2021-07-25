# encoding: UTF-8

require 'awesome_print'
require 'json'

fonts = {}
svgbegin = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'
svgend   = '</svg>'
style    = 'style="fill:none; stroke:#000000; stroke-width:1; stroke-linecap:butt; stroke-linejoin:miter; stroke-dasharray:none;"'

size = 10.0

File.open("./fonts/kst32b.lff", mode = "rt"){|f|
  while l = f.gets do 
      next if l.match(/^# /)
      next if l.match(/^$/)

      if mo = l.match(/\[([abcdef0-9]{4})\] (.)/)
        unicode=mo[1]
        char = [unicode.to_i(16)].pack("U*")

        path = "<path #{style} d=\""
        while mo = f.gets.match(/([0-9.]+),([0-9.]+);([0-9.]+),([0-9.]+)/)  do 
          x0 = mo[1].to_f
          y0 = size - mo[2].to_f
          x1 = mo[3].to_f
          y1 = size - mo[4].to_f
          path += "M #{x0} #{y0} L #{x1} #{y1} "
        end
        path += '" />'

        fonts[char] = svgbegin + path + svgend

        #/path = f.gets.chomp
        #fonts[char] = svgbegin + path + svgend
      end
  end
}

puts "export const fontSVG = #{fonts.to_json}"
