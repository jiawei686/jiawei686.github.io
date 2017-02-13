(function () {
	
	$(function(){
		new navi;
	})

	var navi = function(){
		this.click_home();
		this.click_blog();
		this.click_computer();
		this.click_about();
		this.click_version();
		this.click_computerarti();
		this.click_blogarti();
	}

	var p = navi.prototype;
	p.click_home = function(){
		$("#navigation div:eq(0)").click(function(){
			location.href = "http://jiawei1996.github.io";
		})
	}

	p.click_blog = function(){
		$("#navigation div:eq(1)").click(function(){
			location.href = "http://jiawei1996.github.io/blog";
		})
	}

	p.click_computer = function(){
		$("#navigation div:eq(2)").click(function(){
			location.href = "http://jiawei1996.github.io/computer";
		})
	}

	p.click_about = function(){
		$("#navigation div:eq(3)").click(function(){
			location.href = "http://jiawei1996.github.io/about";
		})
	}

	p.click_version = function(){
		$("#navigation div:eq(4)").click(function(){
			location.href = "http://jiawei1996.github.io/version";
		})
	}

	p.click_computerarti = function(){
		$(".article .computer").click(function(){
			location.href = "http://jiawei1996.github.io/computer/" + this.id;
		})
	}

	p.click_blogarti = function(){
		$(".article .blog").click(function(){
			location.href = "http://jiawei1996.github.io/blog/" + this.id;			
		})
	}




})();