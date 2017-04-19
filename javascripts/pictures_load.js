(function(){
	var index = -1;
	setTimeout(function(){

		setTimeout(function(){
			$("#mainpage_singer").fadeTo(1000,1);
			show_pictures();
			var timeout;
			function show_pictures(){
				if(index > -1) $("figure").eq(index).fadeTo(600,1);
				index++;
				timeout = setTimeout(show_pictures,400);
				if(index > 4) clearTimeout(timeout);
			}		
		},1000);
		
	},1000);
	

})();