class Font {
  constructor(width, height) {
    this.width  = width
    this.height = height
  }

  parse(fontSVGs) {
    let fonts = {}
    for (let [key, value] of Object.entries(fontSVGs)) {
      const svg = this.parseSVG(value)
      fonts[key] = svg.firstElementChild
    }

    this.fonts = fonts
    return fonts
  }

  parseSVG(svgString) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'text/xml')
    return doc.documentElement
  }

  travase(str, resolution, callback) {
    const path = this.fonts[str]
    this.traversePath(path, resolution, callback)
  }

  traversePath(path, resolution, callback) {
    const len = path.getTotalLength()
    const dl  = len / resolution
    for( var i = 0; i < resolution; i++ ) {
      const l = i * dl 
      const p = path.getPointAtLength(l)
      const x = p.x / this.width
      const y = p.y / this.height
      callback(x , y)
    }
  }
}

module.exports = Font
