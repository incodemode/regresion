function unique(arr){
	var sorted_arr = arr.slice().sort();

	var results = [];
	for (var index in sorted_arr) {
	    if(sorted_arr.indexOf(sorted_arr[index]) == index){
	        results.push(sorted_arr[index]);
	    }
	}

	return results;
}