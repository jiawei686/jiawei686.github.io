(function(){
	var index = -1;
	show_pictures();
	var timeout;
	function show_pictures(){
		if(index > -1) $(".navi_fadein").eq(index).fadeTo(600,1);
		index++;
		timeout = setTimeout(show_pictures,400);
		if(index > $(".navi_fadein").length - 1) clearTimeout(timeout);
	}

	

})();