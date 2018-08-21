
function geneticAlgorithm(properties){

	var validator = properties.validator;
	var generationsCount = properties.generationsCount;
	var populationCount = properties.populationCount;
	var randomize = properties.randomize;
	var fitnessFunction = properties.fitnessFunction;
	var equals = properties.equals;
	var crossover = properties.crossover;
	var newGenerationStartedCallback = properties.newGenerationStartedCallback;
	var newGeneFoundCallback = properties.newGeneFoundCallback;

	var orderByFitness = function(genes){
		
		
		genes.sort(function(a, b) {
    		return a.fitness - b.fitness;
		});
		return genes;
	};
	
	
	this.execute = function(){
		var genes = [];
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
						tryPushGene(genes, possibleGene);	
						if(genes.length>=populationCount){
							status = "fillingGenerations";
						}
						break;
					case "fillingGenerations":
						if(currentGeneration>generationsCount){
							
							clearInterval(interval);
						}else if(genes.length >= populationCount){
							

							oneThird = Math.floor(populationCount/2);
							genes.splice(oneThird,populationCount-oneThird);
							
							newGenerationStartedCallback(currentGeneration+1);
							currentGeneration++;
							for(var i in genes){

								newGeneFoundCallback(genes[i]);
							}
							
						}else{
							var gene1 = genes[Math.floor(Math.random()*oneThird)];
							var gene2 = genes[Math.floor(Math.random()*oneThird)];
							var gene3 = crossover(gene1.gene, gene2.gene);
							tryPushGene(genes, gene3);
							if(genes[0].fitness ==0){
								
								
								return;
							}
						}
						break;

				}
				setTimeout(iterable,100);
			
		}
		newGenerationStartedCallback(1);
		setTimeout(iterable,100);

				
	
	}

	function tryPushGene(genes, gene){
		
			
		var gene = validator(gene);
		if(!gene){
			return;
		}
		for(var i in genes){
			existentObject = genes[i];
			if(equals(gene, existentObject.gene)|| existentObject.gene == gene){
				return;
			}
		}
		var fitness = fitnessFunction(gene);
		var inserted = false;
		var geneObject = {number:1,gene:gene, fitness: fitness};
		var i = 0;
		for(i in genes){
			if(!inserted && genes[i].fitness>=fitness){
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
