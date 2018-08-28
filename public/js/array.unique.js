function unique(arr){
	var sorted_arr = arr.slice().sort();
	console.log("sorted_arr:",JSON.parse(JSON.stringify(sorted_arr)));
	var results = [];
	for (var index in sorted_arr) {
	    if(sorted_arr.indexOf(sorted_arr[index]) == index){
	        results.push(sorted_arr[index]);
	    }
	}
	console.log("results:",JSON.parse(JSON.stringify(results)));
	return results;
}