var isNode=new Function("try {return this===global;}catch(e){return false;}");
cluster = null;
http = null;
numCPUs = null;
if (isNode()) {
	//childProcess = require('child_process');
	//iyem = require('iyem')
	cluster = require('cluster');
	http = require('http');
	numCPUs = require('os').cpus().length;
	require('./incodemode.array.insertOrdered');
	
}

genesUsed = [];
tryPushGene = null;
geneticAlgorithm = function(){
	

	//working variables
	var genes = [];
	var newGenes = [];
	var currentGeneration = 1;
	var status = "fillingInitialSetup";
	var currentPopulationCount = 100;
	var finishCriteriaFoundCallbackCalled = false;
	var stopped = true;

	//properties
	var validator = null;
	var generationsCount = null;
	var initialPopulationCount = null;
	var getPopulationCount = null;
	var randomize = null;
	var fitnessFunction = null;
	var equals = null;
	var crossover = null;
	var finishCriteriaTest = null;
	var newGenerationStartedCallback = null;
	var newGeneFoundCallback = null;
	var finishCriteriaFoundCallback = null;
	var batchValidator = null;
	var batchable = null;
	var prepareForBatch = null;
	var selectParent = null;

	var setProperties = function(properties){
		validator = properties.validator;
		generationsCount = properties.generationsCount;
		initialPopulationCount = properties.initialPopulationCount;
		getPopulationCount = properties.getPopulationCount;
		randomize = properties.randomize;
		fitnessFunction = properties.fitnessFunction;
		equals = properties.equals;
		crossover = properties.crossover;
		finishCriteriaTest = properties.finishCriteriaTest;
		newGenerationStartedCallback = properties.newGenerationStartedCallback;
		newGeneFoundCallback = properties.newGeneFoundCallback;
		finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;
		batchValidator = properties.batchValidator;
		batchable = properties.batchable;
		prepareForBatch = properties.prepareForBatch;
		selectParent = properties.selectParent!='undefined'?properties.selectParent:selectRandomParent;
		
	};
/*	this.setState(properties){
		genes = properties.genes;
		newGenes = properties.newGenes;
		currentGeneration = properties.currentGeneration;
		status = properties.status;
		currentPopulationCount = properties.currentPopulationCount;
		finishCriteriaFoundCallbackCalled = properties.finishCriteriaFoundCallbackCalled;
	}*/
	
	var insertGenome = function(genome, sCurrentGeneration, makeCallback = true){
		if(isNode() && cluster.isMaster){
			//console.log("trying to insert in master from outside by checking generation", genome.gene, sCurrentGeneration);
		}
		if(sCurrentGeneration == currentGeneration){
			if(isNode() && cluster.isMaster){
				//console.log("trying to insert in master from outside", genome.gene);
			}
			var pushed = tryPushGene(newGenes,genome, currentGeneration, makeCallback);
			if(pushed&& isNode() && cluster.isMaster){
				//console.log("genome inserted from outside");
			}
			//console.log("just tried to insert genome");
		}
	};
	var updateGeneration = function(generationNumber, oldGenomes){
		//console.log("generation updated on process", process.pid, generationNumber);
			currentGeneration = generationNumber;
			genes = oldGenomes;
			//console.log(genes);
			newGenes = [];
			if(generationNumber ==1){
				status = "fillingInitialSetup";
			}else{
				status = "fillingGenerations";
			}
	};
		
	var selectRandomParent = function(genes){
		return genes[Math.floor(Math.random()*genes.length)];
	};
	
	var orderByFitness = function(genes){
		
		
		genes.sort(function(a, b) {
    		return a.fitness - b.fitness;
		});
		return genes;
	};
	
	var iterable = function(){
		
		switch(status){
			case "fillingInitialSetup":
				
				var possibleGene = randomize();
				var possibleGenomeObject = {gene:possibleGene,generation:currentGeneration};
				if(isNode() && !cluster.isMaster){
					//console.log("trying to insert genome in child for the first generation");
				}
				var pushed = tryPushGene(newGenes, possibleGenomeObject, currentGeneration);	
				if(pushed && isNode() && !cluster.isMaster){
					//console.log("pushed in child, ", possibleGenomeObject.gene);
				}
				if(finishCriteriaTest(newGenes, currentGeneration)){
					if(!finishCriteriaFoundCallbackCalled){
						finishCriteriaFoundCallback(newGenes[0], currentGeneration);
						finishCriteriaFoundCallbackCalled = true;
					}
					stopped = true;
					return 'finish';
				}
				if(newGenes.length>=currentPopulationCount && (!isNode()||cluster.isMaster)){
					status = "fillingGenerations";
				}
				break;
			case "fillingGenerations":
				if(currentGeneration>generationsCount){
					if(!finishCriteriaFoundCallbackCalled){
						finishCriteriaFoundCallback(newGenes[0], currentGeneration);
						finishCriteriaFoundCallbackCalled = true;
					}
					stopped = true;
					return 'finish';
					
				}else if(newGenes.length >= currentPopulationCount && (!isNode() || cluster.isMaster )){

					var oneThird = Math.floor((currentPopulationCount)/2);
					for(var i in newGenes){
						newGenes[i].number = parseInt(i)+1;
					}
					
					/*genes = [];
					for(var i in newGenes){
						genes[i] = Object.create(newGenes[i]);
					}*/
					genes = JSON.parse(JSON.stringify(newGenes));
					newGenes.splice(oneThird,currentPopulationCount-oneThird);
					if(finishCriteriaTest(genes, currentGeneration)){
						if(!finishCriteriaFoundCallbackCalled){
							finishCriteriaFoundCallback(newGenes[0], currentGeneration);
							finishCriteriaFoundCallbackCalled = true;
						}
						stopped = true;
						return 'finish';
					}

					newGenerationStartedCallback(currentGeneration+1, genes);
					currentGeneration++;
					currentPopulationCount = getPopulationCount(initialPopulationCount,genes,currentGeneration);
					for(var i in newGenes){

						newGeneFoundCallback(newGenes[i], currentGeneration);
					}
					
				}else{
					
					var gene1 = selectParent(genes);
					var gene2 = selectParent(genes);
					var gene3 = crossover(gene1, gene2);
					if(isNode() && !cluster.isMaster){
						
						//console.log("trying to crossover genome in child for the generation ", currentGeneration);
						//console.log("trying to crossover genome in child for the generation ", currentGeneration, gene1.gene, gene2.gene);
					}
					if(gene3!==null){
						gene3.generation =  currentGeneration;
						if(isNode() && !cluster.isMaster){
							//console.log("trying to insert genome in child for the generation ", currentGeneration);
						}
						var pushed = tryPushGene(newGenes, gene3, currentGeneration);
						if(pushed){
							//console.log("sending gene to master, ", gene3.gene);
						}
					}
							
					
					if(finishCriteriaTest(newGenes, currentGeneration)){
						if(!finishCriteriaFoundCallbackCalled){
							finishCriteriaFoundCallback(newGenes[0], currentGeneration);
							finishCriteriaFoundCallbackCalled = true;
						}
						stopped = true;
						return 'finish';
					}
				}
				break;

		}
		
			setTimeout(iterable,1);
		
	}
	
	var isFinished = function(){
			return stopped;
	}
	//var clusters = [];
	var execute = function(){
		if(!isNode() || cluster.isMaster){
			
			genes = [];
			newGenes = [];
			currentGeneration = 1;
			status = "fillingInitialSetup";
			currentPopulationCount = initialPopulationCount;
			finishCriteriaFoundCallbackCalled = false;
		}
	
			newGenerationStartedCallback(1, []);
			stopped = false;
			setTimeout(iterable,1);
		
	
		
				
	
	}

	tryPushGene = function(genes, geneObject, currentGeneration, makeCallback = true){
		
		geneObject = validator(geneObject);
			
		if(!geneObject || geneObject.valid !== true){
			return false;
		}
		/*for(var i in genes){
			existentObject = genes[i];
			if(equals(genes[i], geneObject)){
				return false;
			}
		}*/
		//var fitness = fitnessFunction(gene);
		//var inserted = false;
		//var geneObject = {number:1,gene:gene, fitness: fitness};
		var indexToBeInserted = incodemode.array.insertOrdered(genes,geneObject,function(arrAttemptIndex, geneObject){
			return arrAttemptIndex.fitness>geneObject.fitness;
		}, true);
		var previousIndex = indexToBeInserted-1;
		var nextIndex = indexToBeInserted;
		while((genes[previousIndex] != undefined && genes[previousIndex].fitness==geneObject.fitness) 
			|| (genes[nextIndex] != undefined && genes[nextIndex].fitness==geneObject.fitness)){
			if(equals(genes[previousIndex], geneObject)){
				return false;
			}
			if(equals(genes[nextIndex], geneObject)){
				return false;
			}
			previousIndex--;
			nextIndex++;
		}
		//actual insertion
		genes.splice(indexToBeInserted,0,geneObject);

		geneObject.number = 1+parseInt(indexToBeInserted);
		if(makeCallback){
			newGeneFoundCallback(geneObject, currentGeneration);
		}
		return true;
		/*for(var i in genes){
			if(!inserted && genes[i].fitness>geneObject.fitness){
				geneObject.number = 1+parseInt(i);
				genes.splice(i,0,geneObject);
				if(makeCallback){
					newGeneFoundCallback(geneObject, currentGeneration);
				}
				//return;
				inserted = true;
			}else if(inserted){
				genes[i].number = 1+parseInt(i);

				if(parseInt(i) > 5){
					return true;
				}
			}
			
		}
		if(!inserted){
			geneObject.number = genes.length+1;
			genes.push(geneObject);
			if(makeCallback){
				newGeneFoundCallback(geneObject, currentGeneration);
			}
		}*/
		return true;

	}
	return {
		execute,
		isFinished,
		updateGeneration,
		insertGenome,
		setProperties

	};
}


