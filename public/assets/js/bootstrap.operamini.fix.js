$(function(){


	function isOperaMini(){

		var isOperaMini = false;
		isOperaMini = isOperaMini || (navigator.userAgent.indexOf('Opera Mini') > -1);
		//isOperaMini = isOperaMini || (navigator.userAgent.indexOf('Opera') > -1);
		return isOperaMini;
	};
	
	
	    if(isOperaMini()){ //this should only work for Opera Mini
			alert(navigator.userAgent);
	    	$("#operaMiniAlert").show();
	    	
			/*$(document).on("click", '#useExample', function(e){ //bind click which Opera Mini likes better
				e.preventDefault(); //prevent default action
					$(this).collapse({ //manually add collapse to the targeted button
			  		toggle:true
				});
			});
			$(document).on("submit", "form", function(evt){
				evt.preventDefaul();
				return false;
			});*/
			/*$(document).bind('DOMNodeInserted', function(e) {
			    var element = e.target;
			    alert("dom insertion");
			        $(element).find("button,a,submit").each(function(index){
				        this.addEventListener("click", function(evt){
				        	evt.preventDefault();
				        });
				      });
			});*/
	    }
	
});