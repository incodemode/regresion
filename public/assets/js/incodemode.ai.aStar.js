incodemode = typeof incodemode=='undefined'?{}:incodemode;
incodemode.ai = incodemode.ai===undefined?{}:incodemode.ai;
incodemode.ai = incodemode.ai===undefined?{}:incodemode.ai;




incodemode.ai.aStar = function(initialNodeValues, nodeOpener, fitnessFunction, heuristicFunction, goalFunction){
	function betterThanEvaluator(a,b){
		return a.f>=b.f;
	}
	var openNodes = [];
	var indexedOpenNodes = [];
	var closedNodes = [];
	for(var i in initialNodeValues){
		var nodeValue = initialNodeValues[i];
		var g = fitnessFunction(nodeValue);
		var h = heuristicFunction(nodeValue)
		var f =  g + h;
		var desc = JSON.stringify(nodeValue);
		indexedOpenNodes[desc] = true;
		incodemode.array.insertOrdered(openNodes
			,{value:nodeValue, f:f,g:g,h:h, desc:desc}
			,betterThanEvaluator);
	}
	while(openNodes.length!=0){
		var testingNode = openNodes[0];
		/*console.log(testingNode.f);
		console.log(testingNode.value);*/
		if(goalFunction(testingNode.value)){
			return testingNode.value;
		}
		//closedNodes.push(testingNode);
		openNodes.splice(0,1);
		//closedNodes[testingNode.desc] = true;
		var newNodes = nodeOpener(testingNode.value);
		//console.log(newNodes);
		for(var i in newNodes){
			var nodeValue = newNodes[i];
			var desc = JSON.stringify(nodeValue);
			if(indexedOpenNodes[desc] == undefined){
				//alert("inserted One");
				indexedOpenNodes[desc] = true;
				var g = fitnessFunction(nodeValue);
				var h = heuristicFunction(nodeValue)
				var f =  g + h;
				var insertedNode = {value:nodeValue, f:f,g:g,h:h, desc:desc};
				incodemode.array.insertOrdered(openNodes
					,insertedNode
					,betterThanEvaluator);
			}
		}
	}
	return null;
}

