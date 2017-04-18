(function(){
	var index = 0;
	setTimeout(function(){
		show_pictures();
		var timeout;
		function show_pictures(){
			$("figure").eq(index).fadeTo(600,1);
			index++;
			timeout = setTimeout(show_pictures,400);
			if(index == 5) $("#mainpage_singer").fadeTo(1000,1);
			if(index > 4) clearTimeout(timeout);
		}	
	},2000);
	

})();