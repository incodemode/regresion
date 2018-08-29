clean2 = function(arr,deleteValue){
for(var i = 0; i < arr.length; i++){
arr[i] = arr[i].trim();
if(arr[i] == deleteValue){
arr.splice(i, 1);
i--;
}
}
return arr;
};
//Array.prototype.clean2 = clean2;