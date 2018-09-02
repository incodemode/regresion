genesUsed = [];
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
	var finishCriteriaFoundCallback = properties.finishCriteriaFoundCallback;

	var lastGenesUsed = null;
	var totalReverseFitness = null;
	var elitistFunction = function(genes){
		var maxAllowedFitness = genes[Math.floor(genes.length/2)].fitness;
		var maxFitness = Math.min(maxAllowedFitness,genes[genes.length-1].fitness);
		//var maxFitness = genes[genes.length-1].fitness;
		//console.log("maxFitness", maxFitness);

		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 2 - (Math.min(maxAllowedFitness,genes[i].fitness)/maxFitness);
				//totalReverseFitness += 1 - (genes[i].fitness/maxFitness);
				//console.log("genes[i].fitness", genes[i].fitness);
			}
		}
		//console.log("totalReverseFitness", totalReverseFitness);
		var selector = Math.random()*totalReverseFitness;
		//console.log("selector", selector)
		//console.log(selector);
		var currentReverseFitness = 0;
		for(var i = 0;i<genes.length;i++){
			currentReverseFitness += 2 - (Math.min(maxAllowedFitness,genes[i].fitness)/maxFitness);
			//currentReverseFitness += 1 - (genes[i].fitness/maxFitness);
			if(currentReverseFitness > selector){
				//genesUsed.push(i);
				return genes[i];
			}
		}
		//genesUsed.push(genes.length-1);
		return genes[genes.length-1];
	};
	var elitistFunction2 = function(genes){
		//var maxAllowedFitness = genes[Math.floor(genes.length/2)].fitness;
		var maxFitness = genes[genes.length-1].fitness;
		//var maxFitness = genes[genes.length-1].fitness;
		//console.log("maxFitness", maxFitness);

		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 2 - (genes[i].fitness/maxFitness);
				//totalReverseFitness += 1 - (genes[i].fitness/maxFitness);
				//console.log("genes[i].fitness", genes[i].fitness);
			}
		}
		//console.log("totalReverseFitness", totalReverseFitness);
		var selector = Math.random()*totalReverseFitness;
		//console.log("selector", selector)
		//console.log(selector);
		var currentReverseFitness = 0;
		for(var i = 0;i<genes.length;i++){
			currentReverseFitness += 2 - (genes[i].fitness/maxFitness);
			//currentReverseFitness += 1 - (genes[i].fitness/maxFitness);
			if(currentReverseFitness > selector){
				genesUsed.push(i);
				return genes[i];
			}
		}
		genesUsed.push(genes.length-1);
		return genes[genes.length-1];
	};
	var elitistFunction3 = function(genes){
		//var maxAllowedFitness = genes[Math.floor(genes.length/2)].fitness;
		var maxFitness = genes[genes.length-1].fitness;
		//var maxFitness = genes[genes.length-1].fitness;
		//console.log("maxFitness", maxFitness);

		if(lastGenesUsed != genes){
			totalReverseFitness = 0;
			for(var i = 0; i<genes.length; i++){
				totalReverseFitness += 1.2 - (genes[i].fitness/maxFitness);
				//totalReverseFitness += 1 - (genes[i].fitness/maxFitness);
				//console.log("genes[i].fitness", genes[i].fitness);
			}
		}
		//console.log("totalReverseFitness", totalReverseFitness);
		var selector = Math.random()*totalReverseFitness;
		//console.log("selector", selector)
		//console.log(selector);
		var currentReverseFitness = 0;
		for(var i = 0;i<genes.length;i++){
			currentReverseFitness += 1.2 - (genes[i].fitness/maxFitness);
			//currentReverseFitness += 1 - (genes[i].fitness/maxFitness);
			if(currentReverseFitness > selector){
				//genesUsed.push(i);
				return genes[i];
			}
		}
		//genesUsed.push(genes.length-1);
		return genes[genes.length-1];
	};
	var randomFunction = function(genes){
		return genes[Math.floor(Math.random()*genes.length)];
	};
	var selectParent = elitistFunction3;
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
		var lastGenerationFitnessChange = 0;
		var lastFitness = null;

			function iterable(){
				
				switch(status){
					case "fillingInitialSetup":
						var possibleGene = randomize();
						tryPushGene(newGenes, possibleGene);	
						if(newGenes.length != 0 && newGenes[0].fitness ==0){
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
							if(lastFitness == null || lastFitness != newGenes[0].fitness){
								lastFitness = newGenes[0].fitness;
								lastGenerationFitnessChange = currentGeneration;
							}
							if(currentGeneration - lastGenerationFitnessChange > 99){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								return;
							}
							newGenerationStartedCallback(currentGeneration+1);
							currentGeneration++;
							for(var i in newGenes){

								newGeneFoundCallback(newGenes[i]);
							}
							
						}else{
							var gene1 = selectParent(genes);
							var gene2 = selectParent(genes);
							var gene3 = crossover(gene1.gene, gene2.gene);
							tryPushGene(newGenes, gene3);
							
							if(newGenes[0].fitness ==0){
								finishCriteriaFoundCallback(newGenes[0], currentGeneration);
								return;
							}
						}
						break;

				}
				setTimeout(iterable,1);
			
			
		}
		newGenerationStartedCallback(1);
		setTimeout(iterable,1);

				
	
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
