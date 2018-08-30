$(function(){


	function isOperaMini(){

		var isOperaMini = false;
		isOperaMini = isOperaMini || (navigator.userAgent.indexOf('Opera Mini') > -1);
		isOperaMini = isOperaMini || (navigator.userAgent.indexOf('Mobile Safari') > -1);
		return isOperaMini;
	};
	/*if (window.opera) {
	    alert(opera.version()); 
	}*/
	
	    if(isOperaMini()){ //this should only work for Opera Mini
	      $(document).on("click", '#useExample', function(e){ //bind click which Opera Mini likes better
	        e.preventDefault(); //prevent default action
	        $(this).collapse({ //manually add collapse to the targeted button
	          toggle:true
	        });
	      });
	      $(document).on("submit", "form", function(evt){
	      	evt.preventDefaul();
	      	return false;
	      });
	    }
	
});