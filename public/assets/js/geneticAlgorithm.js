genesUsed = [];
function geneticAlgorithm(properties){

	var validator = properties.validator;
	var generationsCount = properties.generationsCount;
	var populationCount = properties.populationCount;
	var randomize = properties.randomize;
	var fitnessFunction = properties.fitnessFunction;
	var equals = properties.equals;
	var crossover = properties.crossover;
	var finishCriteriaTest = properties.finishCriteriaTest;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;
	var finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;

	
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
		var newGenes = [];
		var occupied = false;
		var occupiedGeneration = false;
		var intervalGenerations;
		var currentGeneration = 1;
		var status = "fillingInitialSetup";
		var oneThird;
		var working = false;
		

			function iterable(){
				
				switch(status){
					case "fillingInitialSetup":
						var possibleGene = randomize();
						tryPushGene(newGenes, {gene:possibleGene,generation:currentGeneration});	
						if(finishCriteriaTest(newGenes, currentGeneration)){
							finishCriteriaFoundCallback(newGenes[0], currentGeneration);
							return;
						}
						if(newGenes.length>=populationCount){
							status = "fillingGenerations";
						}
						break;
					case "fillingGenerations":
						if(currentGeneration>generationsCount){
							//finishCriteriaFoundCallback(newGenes[0], currentGeneration);
							//return;
							//clearInterval(interval);
						}else if(newGenes.length >= populationCount){

							oneThird = Math.floor(populationCount/2);
							genes = JSON.parse(JSON.stringify(newGenes));
							newGenes.splice(oneThird,populationCount-oneThird);
							if(finishCriteriaTest(genes, currentGeneration)){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								return;
							}
							
							newGenerationStartedCallback(currentGeneration+1, genes);
							currentGeneration++;
							for(var i in newGenes){

								newGeneFoundCallback(newGenes[i]);
							}
							
						}else{
							var gene1 = selectParent(genes);
							var gene2 = selectParent(genes);
							var gene3 = crossover(gene1.gene, gene2.gene);
							tryPushGene(newGenes, {gene:gene3,generation:currentGeneration});
							
							if(finishCriteriaTest(newGenes, currentGeneration)){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								return;
							}
						}
						break;

				}
				setTimeout(iterable,1);
			
			
		}
		newGenerationStartedCallback(1, null);
		setTimeout(iterable,1);

				
	
	}

	function tryPushGene(genes, geneObject){
		
			
		var geneObject = validator(geneObject);
		if(!geneObject){
			return;
		}
		for(var i in genes){
			existentObject = genes[i];
			if(equals(geneObject.gene, existentObject.gene)|| existentObject.gene == geneObject.gene){
				return;
			}
		}
		//var fitness = fitnessFunction(gene);
		var inserted = false;
		//var geneObject = {number:1,gene:gene, fitness: fitness};
		var i = 0;
		for(i in genes){
			if(!inserted && genes[i].fitness>=geneObject.fitness){
				geneObject.number = 1+parseInt(i);
				genes.splice(i,0,geneObject);
				newGeneFoundCallback(geneObject);
				inserted = true;
			}else if(inserted){
				genes[i].number = 1+parseInt(i);
			}
		}
		if(!inserted){
			geneObject.number = genes.length+1;
			genes.push(geneObject);
			newGeneFoundCallback(geneObject);
		}
		

	}
	return this;
}
