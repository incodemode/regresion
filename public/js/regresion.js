var regresion = function(properties){
	var variablesRunsSet = properties.variablesRunsSet;

	
	var variableNames = [];
	
	var randomize = function(limit = 10){
		var possibleNodes;
		if(limit <= 0){
			possibleNodes = ["number", "pi", "e", "var"];
		}else{
			possibleNodes = ["+","-","*","/","pow","log", "par", "sin", "cos", "tan", "asin", "acos", "atan", "number", "pi", "e", "var"];
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

				var genes = math.random(1000);
				break;
			case "pi":
			case "e":

				var genes = operator;
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
		    console.log(gene + "=");
		    var temp = math.parse(gene).eval(variablesRun);
		    var difference = Math.pow(temp-realY,2);
		    totalDifference+=difference;	
		}
		return totalDifference;
	}
	var validator = function(code){
			for(variablesRunIndex in variablesRunsSet){
				variablesRun = variablesRunsSet[variablesRunIndex];
				var y = null;
				try {
				    console.log(code + "=");
				    var temp = math.parse(code).eval(variablesRun);
				    
				    console.log(temp);
				} catch (e) {
				    return false;
				}
			}
			try{
				code = math.simplify(code).toString();
			}catch(err){
				return false;
			}
			var fitnessValue = fitnessFunction(code);
			if(isNaN(fitnessValue)){
				return false;
			}
			
			return code;
	};
	var equals = function(gene1, gene2){
		var equal = math.parse(gene1).equals(gene2);
		return equal;
	};
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
			generationsCount:100,
			populationCount:20,
			fitnessFunction: fitnessFunction
		});
		ga.execute();
	};
	return this;
}