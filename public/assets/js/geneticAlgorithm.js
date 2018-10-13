genesUsed = [];
tryPushGene = null;
geneticAlgorithm = function(properties){

	var validator = properties.validator;
	var generationsCount = properties.generationsCount;
	var initialPopulationCount = properties.initialPopulationCount;
	var getPopulationCount = properties.getPopulationCount;
	var randomize = properties.randomize;
	var fitnessFunction = properties.fitnessFunction;
	var equals = properties.equals;
	var crossover = properties.crossover;
	var finishCriteriaTest = properties.finishCriteriaTest;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;
	var finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;
	var batchValidator = properties.batchValidator;
	var batchable = properties.batchable;
	var prepareForBatch = properties.prepareForBatch;

	
	var selectRandomParent = function(genes){
		return genes[Math.floor(Math.random()*genes.length)];
	};
	var selectParent = properties.selectParent!='undefined'?properties.selectParent:selectRandomParent;
	var orderByFitness = function(genes){
		
		
		genes.sort(function(a, b) {
    		return a.fitness - b.fitness;
		});
		return genes;
	};
	
	
	this.execute = function(){
		var genes = [];
		newGenes = [];
		var occupied = false;
		var occupiedGeneration = false;
		var intervalGenerations;
		var currentGeneration = 1;
		var status = "fillingInitialSetup";
		var oneThird;
		var working = false;
		var currentPopulationCount = initialPopulationCount;
		var finishCriteriaFoundCallbackCalled = false;
		var filled = false;
		var batched = false;
		var possibleGenes = [];
			function iterable(){
				
				switch(status){
					case "fillingInitialSetup":
						//if(possibleGenes.length == 0){
							//var needed = 1;
							//possibleGenes.push({gene:"1.0571243112754385",generation:currentGeneration});
							//var possibleGene = "0";
							if(!filled){
							
								var needed = Math.min(200,(currentPopulationCount-newGenes.length+2)*1.33);
								for(var i =0;i<20;i++){
									var possibleGene = randomize();
									var possibleGenomeObject = {gene:possibleGene,generation:currentGeneration};
									//prepareForBatch(possibleGenomeObject);
									possibleGenes.push(possibleGenomeObject);
								}
								if(possibleGenes.length>needed){filled = true; batched = false};
							}else{
								if(!batched && batchable()){
									possibleGenes = batchValidator(possibleGenes);
									batched = true;
								}
							}
							//console.log(possibleGenes);
						//}
						if(filled){
							if(possibleGenes.length != 0){
								var possibleGenesSpliced = possibleGenes.splice(0,1);
								tryPushGene(newGenes, possibleGenesSpliced[0], currentGeneration);	
							}else{
								filled = false;
								batched = false;
							}
						}
						
						if(finishCriteriaTest(newGenes, currentGeneration)){
							if(!finishCriteriaFoundCallbackCalled){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								finishCriteriaFoundCallbackCalled = true;
							}
							return;
						}
						if(newGenes.length>=currentPopulationCount){
							possibleGenes = [];
							filled = false;
							batched = false;
							status = "fillingGenerations";
						}
						break;
					case "fillingGenerations":
						if(currentGeneration>generationsCount){
							if(!finishCriteriaFoundCallbackCalled){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								finishCriteriaFoundCallbackCalled = true;
							}
							return;
							
						}else if(newGenes.length >= currentPopulationCount){

							oneThird = Math.floor((currentPopulationCount)/2);
							for(var i in newGenes){
								newGenes[i].number = parseInt(i)+1;
							}
							//genes = JSON.parse(JSON.stringify(newGenes));
							genes = [];
							for(var i in newGenes){
								genes[i] = Object.create(newGenes[i]);
								//genes[i].number = i;
							}
							//genes = newGenes.slice(0);
							newGenes.splice(oneThird,currentPopulationCount-oneThird);
							if(finishCriteriaTest(genes, currentGeneration)){
								if(!finishCriteriaFoundCallbackCalled){
									finishCriteriaFoundCallback(newGenes[0], currentGeneration);
									finishCriteriaFoundCallbackCalled = true;
								}
								return;
							}
							possibleGenes = [];
							filled = false;
							batched = false;
							newGenerationStartedCallback(currentGeneration+1, genes);
							//currentPopulationCount = populationCount + Math.floor(Math.log(currentGeneration+1)*25);
							//currentPopulationCount = populationCount + (1-(1/(math.log(currentGeneration+1)+1)))*150;//230
							currentGeneration++;
							currentPopulationCount = getPopulationCount(initialPopulationCount,genes,currentGeneration);
							for(var i in newGenes){

								newGeneFoundCallback(newGenes[i], currentGeneration);
							}
							
						}else{
							
							//tryPushGene(newGenes, {gene:gene3,generation:currentGeneration});
							//if(possibleGenes.length == 0){
								if(!filled){
									var needed = Math.min((currentPopulationCount-newGenes.length+2)*1.33,200);
									//var needed = 1;
									for(var i =0;i<20;i++){
										var gene1 = selectParent(genes);
										var gene2 = selectParent(genes);
										var gene3 = crossover(gene1, gene2);
										if(gene3!==null){
											gene3.generation =  currentGeneration;
											
											//prepareForBatch(gene3);
											
											possibleGenes.push(gene3);
										}
									}
									if(possibleGenes.length>needed){
										filled = true; 
										batched = false;
									};
								}else{
									
									if(!batched && batchable()){
										possibleGenes = batchValidator(possibleGenes);
										batched = true;
									}
								}
							//}
							if(filled){
								if(possibleGenes.length != 0){
									tryPushGene(newGenes, possibleGenes.splice(0,1)[0], currentGeneration);	
								}else{
									filled = false;
									batched = false;
								}
							}
							if(finishCriteriaTest(newGenes, currentGeneration)){
								if(!finishCriteriaFoundCallbackCalled){
									finishCriteriaFoundCallback(newGenes[0], currentGeneration);
									finishCriteriaFoundCallbackCalled = true;
								}
								return;
							}
						}
						break;

				}
				setTimeout(iterable,0);

			
			
		}
		newGenerationStartedCallback(1, null);
		setTimeout(iterable,0);
		
				
	
	}

	tryPushGene = function(genes, geneObject, currentGeneration){
		
		if(geneObject.valid !== true){
			if(!batchable()){
				geneObject = validator(geneObject);
			}else{
				return;
			}
		}
		if(!geneObject){
			return;
		}
		for(var i in genes){
			existentObject = genes[i];
			if(equals(genes[i], geneObject) || existentObject.gene == geneObject.gene){
				return;
			}
		}
		//var fitness = fitnessFunction(gene);
		var inserted = false;
		//var geneObject = {number:1,gene:gene, fitness: fitness};
		
		for(var i in genes){
			if(!inserted && genes[i].fitness>geneObject.fitness){
				geneObject.number = 1+parseInt(i);
				genes.splice(i,0,geneObject);
				newGeneFoundCallback(geneObject, currentGeneration);
				//return;
				inserted = true;
			}else if(inserted){
				genes[i].number = 1+parseInt(i);

				if(parseInt(i) > 5){
					return;
				}
			}
			
		}
		if(!inserted){
			geneObject.number = genes.length+1;
			genes.push(geneObject);
			newGeneFoundCallback(geneObject, currentGeneration);
		}
		

	}
	return this;
}
