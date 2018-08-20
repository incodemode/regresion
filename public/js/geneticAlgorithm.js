
function geneticAlgorithm(properties){

	var validator = properties.validator;
	var generationsCount = properties.generationsCount;
	var populationCount = properties.populationCount;
	var randomize = properties.randomize;
	var fitnessFunction = properties.fitnessFunction;
	var equals = properties.equals;
	var crossover = properties.crossover;
	
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
		var currentGeneration = 0;
		var status = "fillingInitialSetup";
		var oneThird;
		var interval = setInterval(function(){
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
						console.log("genes: ", genes);
						console.log("currentGeneration: ", currentGeneration);
						clearInterval(interval);
					}else if(genes.length >= populationCount){
						orderByFitness(genes);
						console.log("genes: ",JSON.parse(JSON.stringify(genes)));
						console.log("currentGeneration: ", currentGeneration);
						currentGeneration++;
						if(genes[0].fitness ==0){
							clearInterval(interval);
							
							return;
						}
						oneThird = Math.floor(populationCount/2);
						genes.splice(oneThird,populationCount-oneThird);
						console.log("genes: ",JSON.parse(JSON.stringify(genes)));
						console.log("currentGeneration: ", currentGeneration);
					}else{
						var gene1 = genes[Math.floor(Math.random()*oneThird)];
						var gene2 = genes[Math.floor(Math.random()*oneThird)];
						var gene3 = crossover(gene1.gene, gene2.gene);
						tryPushGene(genes, gene3);
					}

			}
		},100);

				
	
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
		genes.push({gene:gene, fitness: fitness});
		

	}
	return this;
}
