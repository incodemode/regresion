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
		if(genes.length != populationCount){
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
		if(limit <= 0){
			possibleNodes = ["int","number", "pi", "e", "var", "zero", "one"];
		}else{
			possibleNodes = ["+","-","*","/","^","sqrt","log", "par", "sin", "cos", "tan", "asin", "acos", "atan", "int", "number", "pi", "e", "var", "zero", "one"];
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
			case "log":
			//case "nthRoot":
				var op1 = randomize(limit -1);
				var op2 = randomize(limit -1);
				genes = operator+"("+op1+","+op2+")";
				break;
			case "par":
				var op1 = randomize(limit -1);
				genes = "(" + op1 + ")";
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

				var genes = random_powerlaw(0.0000001,Number.MAX_VALUE);
				break;
			case "int":

				var genes = Math.floor(random_powerlaw(1,Number.MAX_VALUE)-1);
				break;
			case "pi":
			case "e":

				var genes = operator;
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

	var fitnessFunction = function(gene){
		var totalDifference = 0;
		try {
			var mathObj = math.parse(gene);
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				var realY = variablesRun.y;
			    var temp = mathObj.eval(variablesRun);
			    var difference = Math.pow(temp-realY,2);
			    totalDifference+=difference;	
			}
		} catch (e) {
		    return false;
		}
		return totalDifference;
	}
	var validator = function(geneObject){
		var code = geneObject.gene;
		if(code == null || code.length>50 || code == 'NaNi'){
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
				var simplifyExtraRules = math.simplify.rules.concat([
				'tan(atan(n1)) -> n1',
				'cos(acos(n1)) -> n1',
				'sin(asin(n1)) -> n1',
				'1^n1 -> 1',
				]);
				//code = math.rationalize(math.simplify(code, simplifyExtraRules)).toString();
				code = math.simplify(code, simplifyExtraRules, {exactFractions: false}).toString();
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
			var fitnessValue = fitnessFunction(code);
			if(isNaN(fitnessValue)||fitnessValue == null|| fitnessValue == 'NaNi' || fitnessValue == 'Infinity' || fitnessValue === false){
				return false;
			}
			
			return {gene:code,fitness:fitnessValue};
	};
	var equals = function(gene1, gene2){
		var equal = math.parse(gene1).equals(gene2);
		return equal;
	};
	var crossover = function(gene1, gene2){
		try{
			
			/*if(math.random()<0.1){
				var gene2 = randomize();
				//pruneTwoNode = math.parse(mutationString);
			}*/

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
			if(math.random()<0.1){
				var mutationString = randomize();
				pruneTwoNode = math.parse(mutationString);
			}
			if(pruneOneParent!== null){
				eval('pruneOneParent.' + pruneOnePath + '=pruneTwoNode;');
			}else{
				crossedObject = pruneTwoNode;

			}
			
		
			crossedString = crossedObject.toString();
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