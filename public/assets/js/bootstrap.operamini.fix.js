$(function(){
	alert("llega a ready");
	if (typeof operamini != 'undefined') {  //check to see if operamini a JS var added by Opera Mini browser exists so other browsers won't error
	    if(operamini){ //this should only work for Opera Mini
	      alert("operamini");
	      $(document).on("click", '#menuButton', function(e){ //bind click which Opera Mini likes better
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
	}
});