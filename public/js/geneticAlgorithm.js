
function geneticAlgorithm(properties){

	var validator = properties.validator;
	var generationsCount = properties.generationsCount;
	var populationCount = properties.populationCount;
	var randomize = properties.randomize;
	var fitnessFunction = properties.fitnessFunction;
	var equals = properties.equals;
	var orderByFitness = function(genes){
		
		
		genes.sort(function(a, b) {
    		return a.fitness - b.fitness;
		});
		return genes;
	};
	
	this.execute = function(){
		var genes = [];
		while(genes.length<20){
			
			var possibleGene = randomize();
			tryPushGene(genes, possibleGene);

		}
		console.log(genes);
		for(var i = 0; i<generationsCount;i++){
			orderByFitness(genes);
			for(var j = Math.floor(populationCount/3);j<populationCount;j++){
				
			}
		}
		console.log(genes);
	}
	function tryPushGene(genes, gene){
		
			
		var valid = validator(gene);
		if(!valid){
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
