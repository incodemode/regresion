/*
Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Compute the edit distance between the two given strings

incodemode = typeof incodemode=='undefined'?{}:incodemode;
incodemode.math = incodemode.math===undefined?{}:incodemode.math;
incodemode.math = incodemode.math===undefined?{}:incodemode.math;

incodemode.math.levenshteinCache = {};
incodemode.math.clearLevenshteinCache = function(){
  incodemode.math.levenshteinCache = {};
}
incodemode.math.levenshtein = function(aString, bString){
  if(incodemode.math.levenshteinCache["a:"+aString+"||b:"+bString]!==undefined){
    return incodemode.math.levenshteinCache["a:"+aString+"||b:"+bString];
  }
  var a = [];
  var b = [];
  function simplify(arr,node,path,parent){
    var content;
    if(node.op!==undefined){
      content = node.op ;
      arr.push(content);
    }else if(node.name!==undefined){
      if(node.name == "e" || node.name == "pi"){
        arr.push("#");
      }
      content = node.name;
      arr.push(content);
    }else if(node.value !== undefined){
      arr.push("#");
      content = Math.floor(Math.log(Math.abs(node.value)));
      arr.push(content);
      arr.push(node.value);
    }else if(node.content !== undefined){
      content = "()";
      arr.push(content);
    }else{
      alert("content not found");
    }
    
  }
  math.parse(aString).traverse(function (node, path, parent){
    simplify(a,node,path,parent);
  });
  math.parse(bString).traverse(function (node, path, parent){
    simplify(b,node,path,parent);
  });
  //console.log(a);
  //console.log(b);

  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b[i-1] == a[j-1]){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }
  var lev = matrix[b.length][a.length];
  incodemode.math.levenshteinCache["a:"+aString+"||b:"+bString] = lev;
  return lev;
};
