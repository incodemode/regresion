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
	var elitistParentSelector = function(genes, newGenes){
		
		var maxFitness = genes[genes.length-1].fitness;
		
		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 1.2 - (genes[i].fitness/maxFitness);
			}
			lastGenesUsed = genes;
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
	var clusterizedGenes = [];
	var newClusterizedGenes = [];
	var previousNewGeneslength = 0;
	var lastDGCAGenesUsed = [];
	var clusterSize = 2;
	var difference = function(gene1, gene2){
		if(incodemode.math.levenshteinCache["a:"+gene1+"||b:"+gene2]!==undefined){
		    return incodemode.math.levenshteinCache["a:"+gene1+"||b:"+gene2];
		  }
		var totalDifference = 0;
		try {
			var mathObj1 = math.parse(gene1);
			var mathObj2 = math.parse(gene2);
			var sumMathObj = math.parse("t+(a-b)^2");
			for(variablesRunIndex in variablesRunsSet){
				var variablesRun = variablesRunsSet[variablesRunIndex];
				//var realY = variablesRun.y;
			    var temp1 = mathObj1.eval(variablesRun);
				var temp2 = mathObj2.eval(variablesRun);
			    //var difference = ;
			    totalDifference=sumMathObj.eval({a:temp1,b:temp2,t:totalDifference});	
			}
		} catch (e) {
			alert("false difference");
		    return false;
		}
		var result = math.eval("log(sqrt(t)+1)",{t:totalDifference});
		incodemode.math.levenshteinCache["a:"+gene1+"||b:"+gene2] = result;
		return result;
	}
	var DGCAParentSelector = function(genes, newGenes){
		var maxFitness = genes[genes.length-1].fitness;
		
		if(lastDGCAGenesUsed != genes){
			lastDGCAGenesUsed = genes;
			incodemode.math.clearLevenshteinCache();
			
			var initialNodeValues = [{clusters:[], spare:[]}];
			for(var i=0;i<clusterSize;i++){
				initialNodeValues[0].clusters.push([]);
			}

			for(var i in genes){
				initialNodeValues[0].spare.push(i);
			}

			var initialSize = 0;
			for(var i in genes){
				var clusterizedFunction = genes[i].gene;
				for(var j = parseInt(i)+1 ;j<genes.length;j++){
					var clusterizedFunction2 = genes[j].gene;
					initialSize += difference(clusterizedFunction,clusterizedFunction2);
				}
			}
			var dFunction = function(node){
				var currentSize = 0;
				for(var i in node.spare){
					var clusterizedFunction = genes[node.spare[i]].gene;
					for(var j = parseInt(i)+1 ;j<node.spare.length;j++){
						var clusterizedFunction2 = genes[node.spare[j]].gene;
						currentSize += difference(clusterizedFunction,clusterizedFunction2);
					}
				}
				return initialSize-currentSize;
			}
			var maxClusterLength = Math.floor((genes.length)/clusterSize);
			//var clusters = incodemode.ai.aStarRelaxed(initialSize/5,initialSize,dFunction,initialNodeValues, 
			var clusters = incodemode.ai.aStar(initialNodeValues, 
				function(inNode){
					var node = $.extend(true, {}, inNode);
					var newNodes = [];
					if(node.spare.length!=0){
							for(var i in node.spare){
								var spareRemoved = node.spare[i];
								var newNode = $.extend(true, {}, node);
								for(var j in newNode.clusters){
									if(node.clusters[j].length<maxClusterLength){

										
										newNode.spare.splice(i,1);
										incodemode.array.insertOrdered(newNode.clusters[j],spareRemoved,function(a,b){return a>=b;});
										newNodes.push(newNode);
										break;
									}
								}
							}
						
							/*var spareRemoved = node.spare[0];
							node.spare.splice(0,1);
							var filledFirstPad = 0;
							for(var i in node.clusters){
								if(node.clusters[i].length<maxClusterLength){
									filledFirstPad = 1;
								}
							}
							for(var i in node.clusters){
								if(node.clusters[i].length<=maxClusterLength-filledFirstPad){
									var newNode = $.extend(true, {}, node);
									incodemode.array.insertOrdered(newNode.clusters[i],spareRemoved,function(a,b){return a>=b;});
									//newNode.clusters[i].push(spareRemoved);
									newNodes.push(newNode);
									if(newNode.clusters[i].length == 1){
										break;
									}
								}
							}*/
							return newNodes;
						
					}
					return newNodes;
				}, function(node){
					var totalFitness = 0;
					for(var i in node.clusters){
						for(var j in node.clusters[i]){
							var clusterizedFunction = genes[node.clusters[i][j]].gene;
							for(var k=parseInt(j)+1;k<node.clusters[i].length;k++){
								var clusterizedFunction2 = genes[node.clusters[i][k]].gene;
								totalFitness += difference(clusterizedFunction,clusterizedFunction2);
							}
						}
						
					}
					return totalFitness;
					/*var totalAdvantage = 0;
					for(var i in node.clusters){
						for(var k in node.clusters[i]){
							var clusterizedFunction = genes[node.clusters[i][k]].gene;
							for(var j = i +1; j < node.clusters.length ; j++){
								if(j!=i){
									for(var l in node.clusters[j]){
										var clusterizedFunction2 = genes[node.clusters[j][l]].gene;
										totalAdvantage += difference(clusterizedFunction,clusterizedFunction2);
									}
								}
							}
						}
					}
					return initialSize - totalAdvantage;*/
					//return totalFitness-totalAdvantage;
					
				}, function(node){
					return  0;
					//return 0;
					/*return node.spare.length;*/
					/*var sumMinSpareDistances = 0;
					//por cada uno de los spares
					for(var j in node.spare){
						var clusterizedFunction = genes[node.spare[j]].gene;
						minSpareDistance = null;
						//obtengo el minimo necesario para incluir el spare en un cluster
						for(var i in node.clusters){
							if(node.clusters[i].length<maxClusterLength){
								var distanceSum = 0;
								for(var k in node.clusters[i]){
									var clusterizedFunction2 = genes[node.clusters[i][k]].gene;
									distanceSum += difference(clusterizedFunction,clusterizedFunction2);
								}
								if(minSpareDistance == null){
									minSpareDistance = distanceSum;
								}else{
									minSpareDistance = Math.min(minSpareDistance, distanceSum);
								}
							}
						}
						if(minSpareDistance == null){
							minSpareDistance = 0;
						}
						sumMinSpareDistances+=minSpareDistance;
					}*/
					if (node.spare.length !=0) {
						/*var leftOver = 0;
						for(var i in node.spare){
							var clusterizedFunction = genes[node.spare[i]].gene;
							for(var j = parseInt(i)+1 ;j<node.spare.length;j++){
								var clusterizedFunction2 = genes[node.spare[j]].gene;
								leftOver += difference(clusterizedFunction,clusterizedFunction2);
							}
						}*/
						possibleSpare = node.spare[0];
						var clFunction1 = genes[possibleSpare].gene;
						var maxAttemptDistance = null;
						for(var i in node.clusters){
							if(node.clusters[i].length<maxClusterLength){
								var attemptDistance = 0;
								for(var j in node.clusters){
									if(j!=i){
										for(var k in node.clusters[j]){
											var clFunction2 = genes[node.clusters[j][k]].gene;
											var distance = difference(clFunction1, clFunction2);
											attemptDistance+=distance;
										}
									}

								}
								if(maxAttemptDistance==null || attemptDistance<maxAttemptDistance){
									maxAttemptDistance = attemptDistance;
								}
							}
						}
						return maxAttemptDistance;
					}
					return 0;

					//obtengo la mayor distancia entre dos de los spare
					/*maxSpareDistance = 0;
					for(var i in node.spare){

						var clusterizedFunction = genes[node.spare[i]].gene;
						for(var j=i; j<node.spare.length;j++){
							var clusterizedFunction2 = genes[node.spare[j]].gene;
							var distance = incodemode.math.levenshtein(clusterizedFunction,clusterizedFunction2);
							maxSpareDistance = Math.max(maxSpareDistance, distance);
						}
					}*/
					/*var totalAdvantage2 = 0;
					for(var i in node.spare){
						var clusterizedFunction = genes[node.spare[i]].gene;
						for(var j = parseInt(i)+1; j<node.spare.length;j++){
						
							
							var clusterizedFunction2 = genes[node.spare[j]].gene;
							totalAdvantage2 += incodemode.math.levenshtein(clusterizedFunction,clusterizedFunction2);
							
						}
						
					}*/
					/*totalAdvantage = (node.spare.length/genes.length)*totalAdvantage*0.8 + (1-(node.spare.length/genes.length))*totalAdvantage2*0.2;*/
					/*var totalAdvantage = 0;
					var medoidsLength = node.medoids.length;
					for(var i = 0; i<medoidsLength;i++){
						var firstMedoidFunction = genes[node.medoids[i]].gene;
						for(var j=i+1; j<medoidsLength;j++){
							var secondMedoidFunction = genes[node.medoids[j]].gene;
							totalAdvantage += incodemode.math.levenshtein(firstMedoidFunction,secondMedoidFunction);
						}
					}*/
					return /*node.spare.length - totalAdvantage + */sumMinSpareDistances;// + maxSpareDistance;// + node.medoids.length-totalAdvantage;
				}, function(node){
					if(node.spare.length == 0){
						return true;
					}
					return false;
				});
			newGenes.splice(0,newGenes.length);
			clusterizedGenes = [];
			newClusterizedGenes = [];
			for(var i in clusters.clusters){
				//clusters.medoids[i] = genes[clusters.medoids[i]].gene;
				clusterizedGenes[i] = [];
				newClusterizedGenes[i] = [];
				for(var j in clusters.clusters[i]){
					var genesObj = genes[clusters.clusters[i][j]];
					incodemode.array.insertOrdered(clusterizedGenes[i],genesObj, function(a,b){
						return a.fitness>=b.fitness;
					});
				}
			}
			console.log(JSON.parse(JSON.stringify(clusterizedGenes)));

			for(var i in clusterizedGenes){
				for(var j in clusterizedGenes[i]){
					if(j<Math.floor(clusterizedGenes[i].length/2)){
						var genesObj = clusterizedGenes[i][j];
						newClusterizedGenes[i].push(genesObj);
						incodemode.array.insertOrdered(newGenes,genesObj, function(a,b){
							return a.fitness>=b.fitness;
						});
						for(var k in newGenes){
							newGenes[k].number = parseInt(k) +1;
						}
						newGeneFoundCallback(genesObj);
					}
				}
			}
			previousNewGeneslength = newGenes.length;
		}
		if(previousNewGeneslength != newGenes.length){
			var inserted = false;
			for(var i in clusterizedGenes){
				
				if(!inserted && clusterizedGenes[i].length!=newClusterizedGenes[i].length){
					newClusterizedGenes.push("m"); //m for Marker
					inserted = true;
				}
				
			}

			previousNewGeneslength = newGenes.length;

		}
		
		for(var i in clusterizedGenes){
			for(var j in clusterizedGenes[i]){
				if(clusterizedGenes[i].length != newClusterizedGenes[i].length){
					return elitistParentSelector(clusterizedGenes[i],[]);
				}
			}
		}
	};

	var lastGenerationFitnessChange = 0;
	var lastFitness = null;
	function finishCriteriaTest(genes, currentGeneration){
		if(lastFitness == null || lastFitness != newGenes[0].fitness){
			lastFitness = newGenes[0].fitness;
			lastGenerationFitnessChange = currentGeneration;
		}
		if(currentGeneration - lastGenerationFitnessChange > 999){
			
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
			//newLastSumFitness = genes[0].fitness;
			
			if(lastSumFitness == null || lastSumFitness > newLastSumFitness){
				lastSumFitness = newLastSumFitness;
				lastGenerationFitnessSumChanged = currentGeneration;
			}else if(currentGeneration-lastGenerationFitnessSumChanged > 999){
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
			limit = Math.floor(Math.random()*3);
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

				var genes = Math.floor(random_powerlaw(1,10000)-1);
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
				'sqrt(n1)^2 -> n1'
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
			
			return {generation: geneObject.generation,gene:code,fitness:fitnessValue};
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
			if(math.random()<0.8){
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
			selectParent: DGCAParentSelector,
			finishCriteriaTest: finishCriteriaTest2,
			newGenerationStartedCallback:newGenerationStartedCallback,
			newGeneFoundCallback:newGeneFoundCallback,
			finishCriteriaFoundCallback:finishCriteriaFoundCallback
		});
		ga.execute();
	};
	return this;
}