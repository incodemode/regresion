l = function(value){
	return Math.log(value);
}
p = function(value, pow){
	return Math.pow(value, pow);
}
function ga(properties){

	var validator = properties.validator;
	var variablesRunsSet = properties.variablesRunsSet;
	var generationsCount = properties.generationsCount;
	var populationCount = properties.populationCount;
	var randomize = properties.randomize;
	var fitness = properties.fitness;
	var orderByFitness = function(genes){
		
		
		genes.sort(function(a, b) {
    		return a.fitness - b.fitness;
		});
		return genes;
	};
	validator("y=x",variablesRunsSet);
	this.execute = function(){
		var genes = [];
		for(var i =0; i< populationCount; i++){
			var valid = false;
			var gene;
			do{
				 gene = randomize();
				 valid = validator(gene,variablesRunsSet);
			}while(!valid);

			genes.push({gene:gene, fitness: fitness(gene)});
		}
		console.log(genes);
		for(var i = 0; i<generationsCount;i++){
			for(var j = Math.floor(populationCount/3);j<populationCount;j++){
				
			}
			orderByFitness(genes);
		}
		console.log(genes);
	}
	return this;
}
