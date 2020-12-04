
  var babel = require("@babel/core");
  var reactPreset = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/@babel/preset-react')
  var emvPreset = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/@babel/preset-env')
  var typescriptPreset = require('C:/Users/sagi.ofir/Documents/FourSouls/NewProject/node_modules/@babel/preset-typescript')

const babelRequire = (url)=>{
    const file = babel.transformFileSync(url, {
        presets: [
          [typescriptPreset, {
            isTSX: true,
            allExtensions: true
          }], reactPreset, emvPreset
        ]
    })
    return eval(file.code)
}

module.exports= babelRequire