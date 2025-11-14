const { Resvg } = require('@resvg/resvg-js')
const fs = require('fs')

const argv = process.argv.slice(2)
const svgPath = argv[0] || 'docs/gantt_chart.svg'
const pngPath = argv[1] || 'docs/gantt_chart.png'
const widthArg = parseInt(argv[2] || '0', 10)
const heightArg = parseInt(argv[3] || '0', 10)

const svg = fs.readFileSync(svgPath, 'utf8')
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: widthArg || undefined } })
// If both width and height provided, pass explicit fitTo object
if (widthArg && heightArg) {
	resvg.options.fitTo = { mode: 'width', value: widthArg }
}
const pngData = resvg.render()
fs.writeFileSync(pngPath, pngData.asPng())
console.log('Wrote', pngPath)
