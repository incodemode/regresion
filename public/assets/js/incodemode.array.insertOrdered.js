incodemode = typeof incodemode=='undefined'?{}:incodemode;
incodemode.array = incodemode.array===undefined?{}:incodemode.array;
incodemode.array = incodemode.array===undefined?{}:incodemode.array;


incodemode.array.insertOrdered = function(arr, insertion, orderEvaluator){
	
	var i = 0;
	if(arr.length ==0){
		arr.push(insertion);
		return;
	}

	var lowerIndex = 0;
	var higherIndex = arr.length-1;
	while(true){
		attemptIndex = Math.floor((higherIndex+lowerIndex)/2);
		if(orderEvaluator(arr[attemptIndex], insertion)){

			if(attemptIndex==0 || !orderEvaluator(arr[attemptIndex-1], insertion)){
				arr.splice(attemptIndex,0,insertion);
				return arr;	
			}else{
				higherIndex = attemptIndex;
			}
		}else{
			if(attemptIndex==arr.length-1){
				arr.splice(attemptIndex+1,0,insertion);
				return arr;	
			}else if(attemptIndex == lowerIndex){
				lowerIndex = lowerIndex+1;
			}else{
				lowerIndex = attemptIndex;
			}
		}
		
	}
	
	//arr.push(insertion);
	return arr;
}