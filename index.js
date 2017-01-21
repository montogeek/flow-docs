import * as babylon from 'babylon';
import traverse from "babel-traverse";
import * as t from "babel-types"
import * as babel from 'babel-core';
import * as flowparser from 'flow-parser'

import * as fs from 'fs';

import * as ejs from 'ejs'

function parse(code) {
  const options = {
    sourceType: 'module',
    plugins: [
      'flow'
    ]
  }
  return babylon.parse(code, options)
  // return babel.transform(code, { parserOpts: options }).ast
  // return flowparser.parse(code);
}

const code = fs.readFileSync('./code.js', 'utf8')

const ast = parse(code)

const tree = {
  functionName: '',
  params: [],
  returnType: ''
};

const plugins = {
  FunctionDeclaration(path, state) {
    tree.functionName = path.node.id.name

    if(path.node.returnType) {
      tree.returnType = path.node.returnType.typeAnnotation.type
    }
  },
  TypeAnnotation(path, state) {
    if(path.parent.name) {
      tree.params.push({
        type: path.node.typeAnnotation.type,
        name: path.parent.name
      })
    }
  }
}


traverse(ast, plugins);

const template = fs.readFileSync('./template.ejs', 'utf8')
const page = ejs.compile(template)

console.log(tree)

fs.writeFileSync('./index.html', ejs.render(template, tree), { encoding: 'utf8' })
