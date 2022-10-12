import fs from 'fs'
import path from 'path'
import gulp from 'gulp'
import read from 'fs-readdir-recursive'
import rimraf from 'rimraf'
const {src, dest, watch, series, parallel} = gulp
const fsPromises = fs.promises

const rootPath = './src'

export const generate = async () => {
    let rootFiles = await fsPromises.readdir(rootPath)

    rootFiles = rootFiles.filter(d => {
        if (d.toString().indexOf('_index') > -1) return false
        console.log(d)
        return fs.lstatSync(path.join(rootPath, d)).isFile()
    })

    let packageImport = ''
    let packageExport = 'const SI = {\n'

    let resultingImport = '// THIS IS AUTOGENERATED FILE DAWG\n'
    let resultingExport = 'const SI = {\n'

    rootFiles.forEach(file => {
        const relativeRoot = rootPath//path.join(rootPath, file)

        // packageExport += `  ${file.replace('.js', '')},\n`

        // rimraf.sync(path.join(relativeRoot, '_index.gen.js'))
        const directoryFiles = read(relativeRoot)


        // directoryFiles.forEach(file => {

            const fullPath = path.join(relativeRoot, file)
            const fileContents = fs.readFileSync(fullPath, {encoding : 'utf-8'})

            let defaultClassGrep = /(?<=export.default.class.)[A-Za-z0-9]*/m.exec(fileContents)
            if (defaultClassGrep) {
                resultingImport += `import ${defaultClassGrep[0]} from "./${file}"\n`
                resultingExport += `  ${defaultClassGrep[0]},\n`
                return;
            }

            let namedExportGrep = /^export*.\{.*\}$/m.exec(fileContents)
            if (namedExportGrep) {
                /** @type {string[]} */
                const namedExports = /\{.*\}/.exec(namedExportGrep[0])[0].split(',').map(v => {
                    v = v.replace('{', '')
                    v = v.replace('}', '')
                    return v.trim()
                })
                resultingImport += `import {${namedExports.join(', ')}} from "./${file}"\n`
                namedExports.forEach(ne => {
                    resultingExport += `  ${ne},\n`
                })
                return
            }


            let defaultExportGrep = /^export.*default.*$/m.exec(fileContents)
            if (defaultExportGrep) {
                const defaultExport = defaultExportGrep[0].trim().split(' ').pop()

                resultingImport += `import ${defaultExport} from "./${file}"\n`
                resultingExport += `  ${defaultExport},\n`
                return
            }

            console.log(`file \x1b[33m${path.join(relativeRoot, file)}\x1b[0m: marked as internal`)
        // })



        // fs.writeFileSync(path.join(relativeRoot, '_index.gen.js'), resultingImport + resultingExport + '}')
    })



    // rootFiles.forEach(d => {
    //     const importPath = path.join(d, '_index.gen.js')
    //     packageImport += `import * as ${d} from "./${importPath}"\n`
    //     packageExport += `  ${d},\n`
    // })

    fs.writeFileSync(path.join(rootPath, '_index.gen.js'), resultingImport + resultingExport + '}\nexport default SI')
}

const doWatch = cb => {
    watch(['**/*.js', '!**/*.gen.js'], generate)

    cb()
}

export const generateAndWatch = series(generate, doWatch)