var regresion = function(properties){
	var variablesRunsSet = properties.variablesRunsSet;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;
	var variableNames = [];
	function random_powerlaw(mini, maxi) {
	    return Math.exp(Math.random()*(Math.log(maxi)-Math.log(mini)))*mini;
	};
	randomize = function(limit = 10){
		var possibleNodes;
		if(limit <= 0){
			possibleNodes = ["int","number", "pi", "e", "var"];
		}else{
			possibleNodes = ["+","-","*","/","^","log", "par", "sin", "cos", "tan", "asin", "acos", "atan", "int", "number", "pi", "e", "var"];
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
				genes = op1+operator+op2;
				break;
			case "pow":
			case "log":
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
				var op1 = randomize(limit -1);
				genes = operator +"(" + op1 + ")";
				break; 
			case "number":

				var genes = random_powerlaw(0.0000001,Number.MAX_VALUE);
				break;
			case "int":

				var genes = math.floor(random_powerlaw(0.0000001,Number.MAX_VALUE));
				break;
			case "pi":
			case "e":

				var genes = math.eval(operator);
				break;
			case "var":
				var variableIndex = Math.floor(Math.random() * variableNames.length); // from 0 to latest character
				var genes = variableNames[variableIndex];
				break;
		}
		
		return genes;
		
	}

	var fitnessFunction = function(gene){
		var totalDifference = 0;
		for(variablesRunIndex in variablesRunsSet){
			var variablesRun = variablesRunsSet[variablesRunIndex];
			var realY = variablesRun.y;
		    var temp = math.parse(gene).eval(variablesRun);
		    var difference = Math.pow(temp-realY,2);
		    totalDifference+=difference;	
		}
		return totalDifference;
	}
	var validator = function(code){

		if(code == null || code.length>50 || code == 'NaNi'){
			return false;
		}
			for(variablesRunIndex in variablesRunsSet){
				variablesRun = variablesRunsSet[variablesRunIndex];
				var y = null;
				try {
				    
				    var temp = math.parse(code).eval(variablesRun);
				    
				    
				} catch (e) {
				    return false;
				}
			}
			try{
				var simplifyExtraRules = math.simplify.rules.concat([
				'tan(atan(n1)) -> n1',
				'cos(acos(n1)) -> n1',
				'sin(asin(n1)) -> n1',
				'1^n1 -> 1',
				]);
				//code = math.rationalize(math.simplify(code, simplifyExtraRules)).toString();
				//code = math.rationalize(code).toString();
				code = math.simplify(code, simplifyExtraRules).toString();
				if(code == null || code == 'undefined' || code == 'Infinity'){
					return false;
				}
			}catch(err){
				return false;
			}
			var fitnessValue = fitnessFunction(code);
			if(isNaN(fitnessValue)||fitnessValue == null|| fitnessValue == 'NaNi' || fitnessValue == 'Infinity'){
				return false;
			}
			
			return code;
	};
	var equals = function(gene1, gene2){
		var equal = math.parse(gene1).equals(gene2);
		return equal;
	};
	var crossover = function(gene1, gene2){
		try{
			

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
			generationsCount:10000,
			populationCount:100,
			fitnessFunction: fitnessFunction,
			crossover: crossover,
			newGenerationStartedCallback:newGenerationStartedCallback,
			newGeneFoundCallback:newGeneFoundCallback
		});
		ga.execute();
	};
	return this;
}