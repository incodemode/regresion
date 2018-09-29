var regresion = function(properties){
	var variablesRunsSet = properties.variablesRunsSet;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;
	var finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;
	var populationCount = properties.populationCount;
	var generationsCount = properties.generationsCount;
	
	var variableNames = [];
	
	var lastGenesUsed = null;
	var totalReverseFitness = null;
	var elitistParentSelector = function(genes){
		
		var maxFitness = genes[genes.length-1].fitness;
		
		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 1.3 - (genes[i].fitness/maxFitness);
			}
		}
		
		var selector = Math.random()*totalReverseFitness;
		var currentReverseFitness = 0;
		for(var i = 0;i<genes.length;i++){
			currentReverseFitness += 1.3 - (genes[i].fitness/maxFitness);
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
		if(genes.length < populationCount){
			return false;
		}
		//if(genesFromFinishCriteria == null || genesFromFinishCriteria != genes){
			var newLastSumFitness = 0;
			genesFromFinishCriteria = genes;
			//genesUnderScope = JSON.parse(JSON.stringify(genes)).splice(5,genes.length);
			for(var i = 0;i<10;i++){
				newLastSumFitness = newLastSumFitness + genes[i].fitness;
			}
			if(lastSumFitness != newLastSumFitness){
				lastSumFitness = newLastSumFitness;
				lastGenerationFitnessSumChanged = currentGeneration;
			}else if(currentGeneration-lastGenerationFitnessSumChanged > 299){
				return true;
			}
			return false;
		//}
		
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
			possibleNodes 	= 	["+","-","*","/","pow","sqrt","log", "par", "minus", "sin", "cos", "tan", "asin", "acos", "atan", "int"/*, "number", "decimal"*/, "pi", "e", "var", "zero", "one"];
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
				genes = "(0-(" + op1 + "))";
				break;
			case "sin":
			case "cos":
			case "tan":
			case "asin":
			case "acos":
			case "atan":
			case "sqrt":
				var op1 = randomize(limit -1);
				genes = operator +"(" + op1 + ")";
				break; 
			case "number":

				var genes = random_powerlaw(0.0000001,1001);
				break;
			case "int":

				var genes = Math.floor(random_powerlaw(1,1001)-1);
				break;
			case "decimal":

				var genes = Math.random();
				break;
			case "pi":
			case "e":

				var genes = math.eval(operator);
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
	const gpu = new GPU();
	var fitnessFunction = function(gene){
		if(useGPU!== undefined && useGPU){
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
			
			
				
				
			innerKernelFunctionText = "var innerKernel = function(a){\r\n";
			var index = 0;
			for(var i in variablesRunsSet[0]){
				innerKernelFunctionText += "var " + i + " = a[this.thread.x]["+index+"];\r\n";
				index++;
			}
			var evaluator = String(gene).replace(/(sin|asin|cos|acos|tan|atan|sqrt|pow|log)/g,"Math.$1");
			innerKernelFunctionText += "\
				var testY = "+evaluator+";\r\n\
				var temp = Math.pow(testY-y,2);\r\n\
				return temp;\r\n\
			}";
			eval(innerKernelFunctionText);
			//console.log(innerKernel);
			const fitnessVector = gpu.createKernel(innerKernel)
			  .setOutput([kernelVariablesRunsSet.length]);
			  //.setOutputToTexture(true);
			var result = fitnessVector(kernelVariablesRunsSet);
			var retest = false;
			if(result.indexOf(0) !== -1){
				retest = true;
			}
			var total = result.reduce(function(a,b){return a+b;});
			var sqrt = Math.sqrt(total);
			
			
			if(!retest){
			  return sqrt;
			}
		}
		
		try {
			var mathObj = math.parse(gene);
			var totalDifference = 0;
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				var realY = variablesRun.y;
			    var temp = mathObj.eval(variablesRun);
			    totalDifference = math.eval("d+pow(t-y,2)",{d:totalDifference,t:temp,y:realY});
			}
		} catch (e) {
			throw e;
		    return false;
		}
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
	var validator = function(geneObject){
		var code = geneObject.gene;
		//var simpleCode = code.replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1");
		if(code == null || String(code).replace(/([0-9]\.[0-9]{2})[0-9]*/g,"$1").length>25 || code == 'NaNi'){
			return false;
		}
			/*
				var mathObj = math.parse(code)
				for(variablesRunIndex in variablesRunsSet){
					variablesRun = variablesRunsSet[variablesRunIndex];
				    var temp = mathObj.eval(variablesRun);
				}
			*/
			
			var fitnessValue = fitnessFunction(code);
			if(isNaN(fitnessValue)||fitnessValue == null|| fitnessValue == 'NaNi' || fitnessValue == 'Infinity' || fitnessValue === false){
				return false;
			}
			try{
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
				'sqrt(n1^2) -> n1'
				]);
				//code = math.rationalize(math.simplify(code, simplifyExtraRules)).toString();
				//code = math.simplify(code, simplifyExtraRules, {exactFractions: false}).toString();
				/*try{
					code = math.rationalize(code).toString();
				}catch(err){

				}*/
				if(code == null || code == 'undefined' || code == 'Infinity'){
					return false;
				}
			}catch(err){
				return false;
			}
			
			return {generation: geneObject.generation,gene:code,fitness:fitnessValue};
	};
	var equals = function(gene1, gene2){
		if(gene1.fitness == gene2.fitness && (math.parse(gene1.gene).equals(gene2.gene) || difference(gene1.gene,gene2.gene) == 0)){
			if(gene2.gene.length<gene1.gene.length){
				gene1 = gene2;
			}
			return true;
		}else{
			return false;
		}
		//var equal = math.parse(gene1).equals(gene2);
		//return equal;
	};
	var difference = function(gene1, gene2){
		var totalDifference = 0;
		try {
			var mathObj1 = math.parse(gene1);
			var mathObj2 = math.parse(gene2);
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				
			    var temp1 = mathObj1.eval(variablesRun);
			    var temp2 = mathObj2.eval(variablesRun);
			    var difference = math.eval("pow(t1-t2,2)",{t1:temp1,t2:temp2});
			    totalDifference=math.eval("d+t",{d:difference,t:totalDifference});	
			}
		} catch (e) {
		    return false;
		}
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
	var crossover = function(gene1In, gene2In){
		try{
			var gene1;
			var gene2;
			if(math.random()<0.1){
				gene1 = crossover(gene1In, gene2In);
				gene2 = crossover(gene1In, gene2In);				
				//pruneTwoNode = math.parse(mutationString);
			}else{
				gene1 = gene1In;
				gene2 = gene2In;
			}

			var gene1Nodes = [];
			var gene2Nodes = [];
			var crossed = gene1;
			math.parse(gene1).traverse(function (node, path, parent){
				gene1Nodes.push(node);
			});
			math.parse(gene2).traverse(function (node, path, parent){
				gene2Nodes.push(node);
			});
			randomPrune1 = Math.floor(Math.random()*gene1Nodes.length);
			randomPrune2 = Math.floor(Math.random()*gene2Nodes.length);
			crossedObject = math.parse(crossed);
			
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
			math.parse(gene2).traverse(function (node, path, parent){
				if(pruneTwoCount == randomPrune1){
					pruneTwoNode = node;
				}
				pruneTwoCount++;
			});

			if(pruneOneParent!== null){
				eval('pruneOneParent.' + pruneOnePath + '=pruneTwoNode;');
			}else{
				crossedObject = pruneTwoNode;

			}
			
		
			crossedString = crossedObject.toString();
			var mutationness = math.eval("1/(log(x+1)+1)",{x:difference(gene1, gene2)} )*0.4+0.1;
			//console.log(mutationness);
			if(math.random()<mutationness || math.parse(gene1).equals(crossedString) || math.parse(gene2).equals(crossedString)){
				var mutationString = randomize();
				return crossover(crossedString, mutationString);
			}
		}catch(err){
			return null;
		}
		
		return crossedString;
	}
	
	this.execute = function(){
		
		variableNames = [];
		for(variableName in variablesRunsSet[0]){
			if(variableName != "y"){
				variableNames.push(variableName);
			}
		}
		var ga = geneticAlgorithm({
			validator: validator,
			randomize: randomize,
			equals: equals,
			generationsCount:generationsCount,
			populationCount:populationCount,
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