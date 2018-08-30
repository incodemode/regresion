$(function(){
	alert("llega a ready");

	function isOperaMini(){
		alert(navigator.userAgent);
		return (navigator.userAgent.indexOf('Opera Mini') > -1);
	};
	/*if (window.opera) {
	    alert(opera.version()); 
	}*/
	
	    if(isOperaMini()){ //this should only work for Opera Mini
	      alert("operamini");
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