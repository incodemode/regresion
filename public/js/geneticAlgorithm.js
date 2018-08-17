
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
		while(genes.length<populationCount){
			
			var possibleGene = randomize();
			tryPushGene(genes, possibleGene);

		}
		orderByFitness(genes);
		console.log(genes);
		for(var i = 0; i<generationsCount;i++){
			var oneThird = Math.floor(populationCount/3);
			genes.splice(oneThird,populationCount-oneThird);
			
			//crossover of genes
			while(genes.length<populationCount){
				var gene1 = genes[Math.floor(Math.random()*oneThird)];
				var gene2 = genes[Math.floor(Math.random()*oneThird)];

				var gene3 = crossover(gene1.gene, gene2.gene);
				tryPushGene(genes, gene3);
			}
			orderByFitness(genes);
			console.log(genes);
			if(genes[0].fitness == 0){
				return;
			}
		}
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
