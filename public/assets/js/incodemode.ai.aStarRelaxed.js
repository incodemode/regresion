incodemode = typeof incodemode=='undefined'?{}:incodemode;
incodemode.ai = incodemode.ai===undefined?{}:incodemode.ai;
incodemode.ai = incodemode.ai===undefined?{}:incodemode.ai;




incodemode.ai.aStarRelaxed = function(admisibleError, maxDepth, dFunction, initialNodeValues, nodeOpener, fitnessFunction, heuristicFunction, goalFunction){
	function betterThanEvaluator(a,b){
		return a.f>=b.f;
	}
	var openNodes = [];
	var closedNodes = [];
	for(var i in initialNodeValues){
		var nodeValue = initialNodeValues[i];
		var g = fitnessFunction(nodeValue);
		var w = (1 + admisibleError - (admisibleError*0)/maxDepth);
		var h = heuristicFunction(nodeValue)
		var f =  g + (w*h);
		incodemode.array.insertOrdered(openNodes
			,{value:nodeValue, f:f,g:g,h:h, d:0}
			,betterThanEvaluator);
	}
	while(openNodes.length!=0){
		var testingNode = openNodes[0];
		
		if(goalFunction(testingNode.value)){
			return testingNode.value;
		}
		
		openNodes.splice(0,1);
		var newNodes = nodeOpener(testingNode.value);
		
		for(var i in newNodes){
			var nodeValue = newNodes[i];
			var d = dFunction(testingNode.value);//.d+1;
			var g = fitnessFunction(nodeValue);
			var w = (1 + admisibleError - (admisibleError*d)/maxDepth);
			var h = heuristicFunction(nodeValue)
			var f =  g + (w*h);
			var insertedNode = {value:nodeValue, f:f,g:g,h:h,d:d};
			incodemode.array.insertOrdered(openNodes
				,insertedNode
				,betterThanEvaluator);
		}
	}
	return null;
}

