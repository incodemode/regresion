var isNode=new Function("try {return this===global;}catch(e){return false;}");
if (isNode()) {
	math = require('mathjs');
}
var simplifyExtraRules = math.simplify.rules.concat([
				'tan(atan(n1)) -> n1',
				'atan(tan(n1)) -> n1',
				'cos(acos(n1)) -> n1',
				'acos(cos(n1)) -> n1',
				'sin(asin(n1)) -> n1',
				'asin(sin(n1)) -> n1',
				'1^n1 -> 1',
				'0^0 -> 1',
				'0^n1 -> 0',
				'log(1,n1) -> 0',
				'sin(pi) -> 0',
				'cos(pi) -> -1',
				'sqrt(n1)^2 -> n1',
				'sqrt(n1^2) -> n1',
				//'n1^n2 -> pow(n1,n2)',
				//'n1 e n2 -> n1*pow(10,n2)',
				]);
simplify = function(gene){
	
	try{
			//code = math.rationalize(math.simplify(code, simplifyExtraRules)).toString();
		var code = math.simplify(gene, simplifyExtraRules, {exactFractions: false}).toString();
		return code;
	}catch(e){
		return gene;
	}
}
regresion = function(properties){
	var variablesRunsSet = properties.variablesRunsSet;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;
	var finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;
	var initialPopulationCount = properties.initialPopulationCount;
	var generationsCount = properties.generationsCount;
	
	var variableNames = [];
	
	var lastGenesUsed = null;
	var totalReverseFitness = null;
	var elitistParentSelector = function(genes){
		
		var maxFitness = genes[genes.length-1].fitness;
		
		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 1.2 - (genes[i].fitness/maxFitness);
			}
		}
		
		var selector = Math.random()*totalReverseFitness;
		var currentReverseFitness = 0;
		for(var i = 0;i<genes.length;i++){
			currentReverseFitness += 1.2 - (genes[i].fitness/maxFitness);
			if(currentReverseFitness > selector){
				return genes[i];
			}
		}
		
		return genes[genes.length-1];
	};
	var lastGenerationFitnessChange = 0;
	var lastFitness = null;
	function finishCriteriaTest(genes, currentGeneration){
		if(lastFitness == null || lastFitness != newGenes[0].fitness){
			lastFitness = newGenes[0].fitness;
			lastGenerationFitnessChange = currentGeneration;
		}
		if(currentGeneration - lastGenerationFitnessChange > 99){
			
			return true;;
		}
		return false
	}
	var genesFromFinishCriteria = null;
	var lastSumFitness = null;
	var lastGenerationFitnessSumChanged = null;
	function finishCriteriaTest2(genes, currentGeneration){
		if(genes.length != 0  && genes[0].fitness ==0){
			return true;
		}
		if(genes.length < getPopulationCount(initialPopulationCount,genes,currentGeneration)){
			return false;
		}
		if(genesFromFinishCriteria == null || genesFromFinishCriteria != genes){
			var newLastSumFitness = 0;
			genesFromFinishCriteria = genes;
			//genesUnderScope = JSON.parse(JSON.stringify(genes)).splice(5,genes.length);
			for(var i = 0;i<5;i++){
				newLastSumFitness = newLastSumFitness + genes[i].fitness;
			}
			if(lastSumFitness != newLastSumFitness){
				lastSumFitness = newLastSumFitness;
				lastGenerationFitnessSumChanged = currentGeneration;
			}else if(currentGeneration-lastGenerationFitnessSumChanged > 99){
				return true;
			}
			return false;
		}
		
	}
	function random_powerlaw(mini, maxi) {
	    return Math.exp(Math.random()*(Math.log(maxi)-Math.log(mini)))*mini;
	};
	var randomize = function(limit){
		if(limit == undefined){
			limit = 2;
		}
		var possibleNodes;
		var weights;
		if(limit <= 0){
			possibleNodes 	= 	["int"/*,"number","decimal"*/,"pi",	"e","var","zero","one"];
			weights			=	[0.3  ,0.3     ,0.3      ,0.05,0.05,1    ,0.5   ,0.5  ];
		}else{
			possibleNodes 	= 	["+","-","*","/","^","sqrt","log", "par", "minus", "sin", "cos", "tan", "asin", "acos", "atan", "int"/*, "number", "decimal"*/, "pi", "e", "var", "zero", "one"];
			weights			=	[1,  1,  1,  1,  1,  1,     1,     1,     1,       1,     1,     1,     1,      1,      1,      0.3,   0.3,      0.3,       0.05, 0.05,1,     0.5,    0.5  ];
		}
		var type = Math.floor(Math.random() * possibleNodes.length); // from 0 to latest character
		var genes = "";
		//type = 1;
		var operator = possibleNodes[type];
		switch(operator){
			case "+":
			case "-":
			case "*":
			case "/":
			case "^":
				var op1 = randomize(limit -1);
				var op2 = randomize(limit -1);
				genes = "("+op1+operator+op2+")";
				break;
			case "pow":
				var op1 = randomize(limit -1);
				var op2 = randomize(limit -1);
				genes = operator+"("+op1+","+op2+")";
				//genes = operator+"("+op1+")";
				break;
			case "log":
			//case "nthRoot":
				var op1 = randomize(limit -1);
				//var op2 = randomize(limit -1);
				//genes = operator+"("+op1+","+op2+")";
				genes = operator+"("+op1+")";
				break;
			case "par":
				var op1 = randomize(limit -1);
				genes = "(" + op1 + ")";
				break;
			case "minus":
				var op1 = randomize(limit -1);
				genes = "-(" + op1 + ")";
				break;
			case "sin":
			case "cos":
			case "tan":
			case "asin":
			case "acos":
			case "atan":
				var op1 = randomize(limit -1);
				genes = operator +"(" + op1 + ")";
				break; 
			case "sqrt":
				var op1 = randomize(limit -1);
				genes = "sqrt(" + op1 + ")";
				break;
			case "number":

				var genes = random_powerlaw(0.0000001,1001);
				break;
			case "int":

				var genes = Math.floor(random_powerlaw(1,10001)-1);
				break;
			case "decimal":

				var genes = Math.random();
				break;
			case "pi":
			case "e":

				var genes = math.round(math.eval(operator),2);
				//var genes = operator;
				break;
			case "var":
				var variableIndex = Math.floor(Math.random() * variableNames.length); // from 0 to latest character
				var genes = variableNames[variableIndex];
				break;
			case "zero":
				var genes = "0";
				break;
			case "one":
				var genes = "1";
				break;
		}
		if(genes===""){
			alert("empty genes with " + operator + " = " + genes);
		}
		return genes;
		
	}
	var usedVariablesRunsSet = null;
	var kernelVariablesRunsSet = [];
	//gpu = new GPU();
	const kernelFunctions = [
				function add(a,b){
					return a + b;
				},
				function substract(a,b){
					return a - b;
				},
				function multiply(a,b){
					return a * b;
				},
				function divide(a,b){
					return a / b;
				}];
				const customText = function(node, options){

						switch(String(node.fn)){
						  case 'unaryMinus':
						    return 'substract(0,' + node.args[0].toString(options) + ')';
						  case 'add':
						  case 'substract':
						  case 'divide':
						  case 'multiply':
						    return String(node.fn)+'('+node.args[0].toString(options)+',' + node.args[1].toString(options) + ')';
						  case 'pow': 
						  	return 'pow(' + node.args[0].toString(options) + ',' + node.args[1].toString(options) + ')';
						  /*case 'log':
						  	return 'log(float(' + node.args[0].toString(options) + '))';
						  case 'sin': 
						  	return 'sin(float(' + node.args[0].toString(options) + '))';
						  case 'cos': 
						  	return 'cos(float(' + node.args[0].toString(options) + '))';
						  case 'tan': 
						  	return 'tan(float(' + node.args[0].toString(options) + '))';
						  case 'asin': 
						  	return 'asin(float(' + node.args[0].toString(options) + '))';
						  case 'acos': 
						  	return 'acos(float(' + node.args[0].toString(options) + '))';
						  case 'atan': 
						  	return 'atan(float(' + node.args[0].toString(options) + '))';
						  case 'sqrt': 
						  	return 'sqrt(float(' + node.args[0].toString(options) + '))';	*/
						}
						if(node.fn == undefined){
							if(node.content!==undefined){
								return "float("+node.content.toString(options) + ")";
							}else if(node.value !== undefined){
								return "float("+String(node.value).replace(/e(\+)?([-0-9.]*)/g,"*pow(float(10),float($2))") + ")";
							} if(node.name !== undefined){
								if(node.name == "i"){
									geneObjects[i].preValid = false;
									return " 0 ";
								}
								//return "float("+String(node.value).replace(/e(\+)?([-0-9.]*)/g,"*pow(float(10),float($2))") + ")";
							}
						}
						//return node.toString(options);
					};

	regexes = [
		[/([0-9.]+)e([0-9]+)/g,"$1e+$2"],
		[/([0-9.]+)e([+0-9-]+)/g,"$1*pow(10,0$2)"],
		[/([0-9]+)([^\.0-9])/g,"$1.$2"],
		[/([0-9]+)\.([0-9]+)\./g,"$1.$2"],
		[/x([0-9]+)\./g,"x$1"],
		[/([0-9]+)\.([0-9]*)/g,"(tv=vec4($1.$2))"],
	];
	replazor = function(string){
		for(var i in regexes){
			string = string.replace(regexes[i][0],regexes[i][1]);
		}
		return string;
	}
	gpuTest = function(geneObjects){
		try{
			if(geneObjects.length == 0){
				return [];
			}
			//if(useGPU!= "undefined" && useGPU){
				if(usedVariablesRunsSet != variablesRunsSet){
					kernelVariablesRunsSet = [];
					for(var i in variablesRunsSet){
						kernelVariablesRunsSet[i] = [];
						var k = 0;
						for(var j in variablesRunsSet[i]){
							
							kernelVariablesRunsSet[i][k] = variablesRunsSet[i][j];
							k++;
						}
					}
					usedVariablesRunsSet = variablesRunsSet;
				}
				var kvrs = kernelVariablesRunsSet;
				
				//console.log(kvrs);
				if (turbojs) {
					var spaces = Math.ceil(kernelVariablesRunsSet.length/4)*4;
					var length = spaces * geneObjects.length;
					var foo = turbojs.alloc(length);
					

					//for (var i = 0; i < length; i++) foo.data[i] = Math.floor(i/4);
					for (var i = 0; i < length; i++) foo.data[i] = i;
					
					
					

					innerKernelFunctionText = `void main(void) {
						
						vec4 index = read();
						vec4 temp = vec4(index/vec4(${spaces}.));
						vec4 funcIndex = vec4(floor(temp));
						vec4 datasetIndex = floor((temp-funcIndex)*vec4(${spaces}.));
						vec4 tv = vec4(0.);`;
						for(var i in variablesRunsSet[0]){
							innerKernelFunctionText += 
							`vec4 ${i};
							`;
							index++;
						}
					var index = 0;
					for(var k in variablesRunsSet){
						var letter = null;
						switch(k%4){
							case 0: letter = 'r'; break;
							case 1: letter = 'g'; break;
							case 2: letter = 'b'; break;
							case 3: letter = 'a'; break;
						}
						if(k%4 == 0){
							//if(k!=0) innerKernelFunctionText += " else ";
							innerKernelFunctionText += `
							if(datasetIndex.${letter} == ${k}.){
								`
						}
						for(var i in variablesRunsSet[k]){
							innerKernelFunctionText += `
								${i}.${letter} = float(${variablesRunsSet[k][i]});
							`;
							index++;
						}
						if(k%4 == 3){
							innerKernelFunctionText += `
							}
							`		
						}
					}
					if(k%4 != 3){
							innerKernelFunctionText += `
							}
							`		
						}
					innerKernelFunctionText += "\
					vec4 testY = vec4(0.); \r\n";
					for(var i in geneObjects){
						//if(i!=0) innerKernelFunctionText += " else ";
						//var gene = geneObjects[i].gene;
						
							
							
							//var evaluator = geneObjects[i].parsed.toString({handler: customText});
							//var evaluator = String(evaluator).replace(/(sin|asin|cos|acos|tan|atan|sqrt|pow|log)/g,"Math.$1");
							var evaluator = geneObjects[i].evaluator;
							//evaluator = replazor(String(" "+evaluator+" "));
								
							innerKernelFunctionText += `
							if(funcIndex.r == ${i}.){
									// ${geneObjects[i].gene}
									testY = vec4(${evaluator});
							} 
							`;

					}
					innerKernelFunctionText += "\r\n\
						vec4 temp2 = pow(testY-y,vec4(2.));\r\n\
						//commit(testY);\r\n\
						commit(temp2);\r\n\
					}";
					//eval(innerKernelFunctionText);
					//console.log(innerKernel);
					//fitnessVector = gpu.createKernel(innerKernel,{outputImmutable:true})
					  //.setOutput([kernelVariablesRunsSet.length, geneObjects.length]);//.setOutputToTexture(true);
					  //.setOutputToTexture(true);
					//var result = fitnessVector(kernelVariablesRunsSet);//.toArray(gpu);
					//console.log(result);
					//console.log(result);
				
					turbojs.run(foo, innerKernelFunctionText);

					for(var i in geneObjects){
						var result = foo.data.subarray(i*spaces, i*spaces+kernelVariablesRunsSet.length);
						if(result.findIndex(function(a){return isNaN(a);})!== -1){
							geneObjects[i].fitness = Number.NaN;
						}else{
							var total = result.reduce(function(a,b){return a+b;});
							//var sqrt = Math.sqrt(total);
							//geneObjects[i].fitness = sqrt;
							geneObjects[i].fitness = total;

						}
					}
				}
			}catch(e){
				turbojs = false;
				throw e;
			}
			return geneObjects;
			
		//}
	}
	var prepareForBatch = function(genome){
		return;
		var parsedGenome = parsed(genome);
		var evaluator = parsedGenome.toString({implicit: 'show',handler:function(node,options){
			if(node.op == '^'){
			return 'pow(' + node.args[0].toString(options) + ',' + node.args[1].toString(options) + ')';}}});
		genome.evaluator = replazor(String(" "+evaluator+" "));
		
	}
	batchable = function(){
		return false;
		if(turbojs){
			return true;
		}else{
			return false;
		}
	}
	compiled = function(genome){
		if(genome.compiled==undefined){
			genome.compiled = math.compile(genome.gene);
		}
		return genome.compiled;
	}
	fitnessFunction = function(gene){
		

		try {
			//var mathObj = parsed(gene);
			var compiledObj = compiled(gene);
			var totalDifference = 0;
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				var realY = variablesRun.y;
			    var temp = compiledObj.eval(variablesRun);
			    totalDifference += Math.pow(temp-realY,2);
			    if(isNaN(totalDifference)||totalDifference == null|| totalDifference == 'NaNi' || totalDifference == 'Infinity' || totalDifference === false){
			    	return false;
			    }
			    //totalDifference = math.eval("d+pow(t-y,2)",{d:totalDifference,t:temp,y:realY});
			}
			//return totalDifference;
		} catch (e) {
			//throw e;
		    return false;
		}
		return totalDifference;
		var ret = math.eval("sqrt(d)",{d:totalDifference});
		if(ret.im !== undefined){
			if(ret.im == 0){
				return ret.re;
			}else{
				return false;
			}
			
		}
		return ret;
	}
	var parsed = function(geneObject){
		if(geneObject.parsed !== undefined){
			return geneObject.parsed;
		}
		try{
			var parsed = math.parse(geneObject.gene);
			//parsed = math.simplify(parsed, simplifyExtraRules, {exactFractions: false});
			geneObject.parsed = parsed;
			return parsed;
		}catch(e){
			throw e;
		}
	}
	var batchValidator = function(geneObjects){

		var leftGeneObjects = [];
		for(var i in geneObjects){
			var code = geneObjects[i].gene;
			//var simpleCode = code.replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1");
			//if(gene.indexOf("NaN")!==-1 && gene.indexOf("NaNi")!==-1){
				try{
					/*var parsed = math.parse(code);
					//parsed = math.simplify(parsed, simplifyExtraRules, {exactFractions: false});
					code = geneObjects[i].gene = parsed.toString();*/
					if(code == null || String(code).replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1").length>50 || String(code).indexOf("NaN")!==-1 || String(code).indexOf("NaNi")!==-1 || String(code).indexOf("i")!==-1){
						//geneObjects[i] = false;
					}else{
							
							
							//geneObjects[i].parsed = parsed;
							leftGeneObjects.push(geneObjects[i]);
					}
				}catch(e){
					throw e;
				}
		}
		var bGeneObjects = gpuTest(leftGeneObjects);
		var cGenes = [];
		//var validos = 0;
		for(var i in bGeneObjects){
			var fitnessValue = bGeneObjects[i].fitness;
			bGeneObjects[i].valid = false;
			if(bGeneObjects[i].preValid == false){

			
			}else if(isNaN(fitnessValue)||fitnessValue == null|| fitnessValue == 'NaNi' || fitnessValue == 'Infinity' || fitnessValue === false){
				bGeneObjects[i].valid = false;
					//bGeneObjects[i].gene = simplify(bGeneObjects[i].gene);
					cGenes.push(bGeneObjects[i]); 
			}else{
				//validos++;
				//bGeneObjects[i].simplified = simplify(bGeneObjects[i].gene);
				bGeneObjects[i].valid = true;
				//bGeneObjects[i].gene = simplify(bGeneObjects[i].gene);
				cGenes.push(bGeneObjects[i]); 
				
			}
		}
		//console.log(validos);
		return cGenes;

	}
	var validator = function(geneObject){
		var code = geneObject.gene;
		//var simpleCode = code.replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1");
		if(code == null || String(code).replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1").length>50 || String(code).indexOf("NaN")!==-1 || String(code).indexOf("NaNi")!==-1){
			return false;
		}
			/*
				var mathObj = math.parse(code)
				for(variablesRunIndex in variablesRunsSet){
					variablesRun = variablesRunsSet[variablesRunIndex];
				    var temp = mathObj.eval(variablesRun);
				}
			*/
			
			try{
				//code = simplify(code);
				if(code == null || code == 'undefined' || code == 'Infinity' || String(code).indexOf("NaN")!==-1 || String(code).indexOf("NaNi")!==-1){
					return false;
				}
				var fitnessValue = fitnessFunction(geneObject);
				if(isNaN(fitnessValue)||fitnessValue == null|| fitnessValue == 'NaNi' || fitnessValue == 'Infinity' || fitnessValue === false || String(fitnessValue).indexOf("NaN")!==-1 || String(fitnessValue).indexOf("NaNi")!==-1){
					return false;
				}
				/*var totalNodes = 0;
				if(geneObject.totalNodes !== undefined){
					totalNodes = geneObject.totalNodes;
				}else{
					math.parse(code).traverse(function (node, path, parent){
						totalNodes++;
					});
					geneObject.totalNodes = totalNodes;
				}
				if(totalNodes>20){
					return false;
				}*/
				
				//code = math.rationalize(math.simplify(code, simplifyExtraRules)).toString();
				//code = math.simplify(code, simplifyExtraRules, {exactFractions: false}).toString();
				/*try{
					code = math.rationalize(code).toString();
				}catch(err){

				}*/
			}catch(err){
				//throw err;
				return false;
			}
			//var simplified = simplify(code);
			return {generation: geneObject.generation,gene:code,fitness:fitnessValue, valid:true};
	};
	var equals = function(gene1, gene2){
		try{
			if(gene1.fitness == gene2.fitness && (math.parse(gene1.gene).equals(gene2.gene) || difference(gene1.gene,gene2.gene) == 0)){
				//if(gene1.fitness == gene2.fitness){
			//if(gene1.fitness == gene2.fitness && math.parse(gene1.gene).equals(gene2.gene)){
				/*if(gene2.gene.length<gene1.gene.length){
					gene1 = gene2;
				}*/
				return true;
			}else{
				return false;
			}
		}catch(e){
			return false;
		}
		//var equal = math.parse(gene1).equals(gene2);
		//return equal;
	};
	var difference = function(gene1, gene2){
		var totalDifference = 0;
		try {
			var mathObj1 = compiled(gene1);
			var mathObj2 = compiled(gene2);
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				
			    var temp1 = mathObj1.eval(variablesRun);
			    var temp2 = mathObj2.eval(variablesRun);
			    var difference = math.eval("pow(t1-t2,2)",{t1:temp1,t2:temp2});
			    totalDifference=math.eval("d+t",{d:difference,t:totalDifference});	
			}
		} catch (e) {
			throw e;
		    //return false;
		}
		return totalDifference;
		var ret = math.eval("sqrt(d)",{d:totalDifference});
		if(ret.im !== undefined){
			if(ret.im == 0){
				return ret.re;
			}else{
				return false;
			}
			
		}
		return ret;
		//return math.eval("sqrt(t)",{t:totalDifference});
	}
	var crossover = function(gene1In, gene2In, limit = 2){
		/*if(limit == undefined){
			limit = 1;
		}*/

		try{
			var gene1;
			var gene2;
			if(limit > 0 && math.random()<0.1){
				gene1 = crossover(gene1In, gene2In, limit-1);
				gene2 = crossover(gene1In, gene2In, limit-1);				
				//pruneTwoNode = math.parse(mutationString);
			}else{
				gene1 = gene1In;
				gene2 = gene2In;
				if(limit == 2 && gene1.s !== true){
					gene1.parsed = math.simplify(gene1.gene, simplifyExtraRules, {exactFractions: true});
					gene1.gene = gene1.parsed.toString();
					gene1.s = true;
				}
				if(limit == 2 && gene2.s !== true){
					gene2.parsed = math.simplify(gene2.gene, simplifyExtraRules, {exactFractions: true});
					gene2.gene = gene2.parsed.toString();
					gene2.s = true;
				}
			}
			
			var gene1Nodes = [];
			var gene2Nodes = [];
			var crossed = gene1.gene;
			var gene1Parsed = math.parse(gene1.gene);//parsed(gene1);
			var gene2Parsed = math.parse(gene2.gene);//parsed(gene2);
			gene1Parsed.traverse(function (node, path, parent){
				gene1Nodes.push(node);
			});
			gene2Parsed.traverse(function (node, path, parent){
				gene2Nodes.push(node);
			});

			randomPrune1 = Math.floor(Math.random()*gene1Nodes.length);
			randomPrune2 = Math.floor(Math.random()*gene2Nodes.length);
			if(randomPrune1 > gene2Nodes.length){
				return null;
			}
			crossedObject = gene1Parsed.cloneDeep();
			
			var pruneOneParent = null;
			var pruneOnePath = null;
			var pruneOneCount = 0;
			crossedObject.traverse(function (node, path, parent){
				if(pruneOneCount == randomPrune1){
					pruneOneParent = parent;
					pruneOnePath = path;
				}
				pruneOneCount++;
			});
			
			var pruneTwoCount = 0;
			pruneTwoNode = null;
			gene2Parsed.cloneDeep().traverse(function (node, path, parent){
				if(pruneTwoCount == randomPrune1){
					pruneTwoNode = node;
				}
				pruneTwoCount++;
			});
			/*if(math.random()<0.1){
				var mutationString = randomize();
				pruneTwoNode = math.parse(mutationString);
			}*/
			if(pruneOneParent!== null){
				eval('pruneOneParent.' + pruneOnePath + '=pruneTwoNode;');
			}else{
				crossedObject = pruneTwoNode;

			}
			
		
			crossedString = crossedObject.toString();
			if(limit >0){
				var mutationness = 0;
				if(gene1.fitness!==undefined && gene2.fitness!==undefined){
					mutationness = 1/(Math.log(Math.abs(gene1.fitness-gene2.fitness)+1)+1)*0.4+0.1;
				}else{
					mutationness = 1/(Math.log(difference(gene1, gene2)+1)+1)*0.4+0.1;
				}
				//console.log(mutationness);
				//mutationness = 0.1;
				if(math.random()<mutationness || gene1Parsed.equals(crossedString) || gene2Parsed.equals(crossedString)){
				
				//if(math.random()<0.1){
					var mutationString = randomize();
					return crossover({gene:crossedString}, {gene:mutationString}, limit -1);
				}
			}
			/*if(math.random()<0.1){
				crossedObject = math.simplify(crossedString, simplifyExtraRules, {exactFractions: false});
				return {gene:crossedObject.toString(), parsed:crossedObject};
			}*/
		}catch(err){
			return null;
		}
		
		return {gene:crossedString};
	}
	var getPopulationCount = function(initialPopulation, genes, currentGeneration){
		//return initialPopulation;
		var currentPopulationCount = initialPopulation + Math.floor(Math.log(currentGeneration+1)*25);
		return currentPopulationCount;
	}
	this.execute = function(){
		
		variableNames = [];
		for(variableName in variablesRunsSet[0]){
			if(variableName != "y"){
				variableNames.push(variableName);
			}
		}
		var ga = geneticAlgorithm({
			batchValidator: batchValidator,
			batchable: batchable,
			prepareForBatch: prepareForBatch,
			validator: validator,
			randomize: randomize,
			equals: equals,
			generationsCount:generationsCount,
			initialPopulationCount:initialPopulationCount,
			getPopulationCount: getPopulationCount,
			fitnessFunction: fitnessFunction,
			crossover: crossover,
			selectParent: elitistParentSelector,
			finishCriteriaTest: finishCriteriaTest2,
			newGenerationStartedCallback:newGenerationStartedCallback,
			newGeneFoundCallback:newGeneFoundCallback,
			finishCriteriaFoundCallback:finishCriteriaFoundCallback
		});
		ga.execute();
	};
	return this;
}