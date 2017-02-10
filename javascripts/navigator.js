(function () {
	
	$(function(){
		new navi;
	})

	var navi = function(){
		this.click_home();
		this.click_blog();
		this.click_code();
		this.click_about();
		this.click_version();
		this.click_computer();
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

	p.click_code = function(){
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

	p.click_computer = function(){
		$(".article h3").click(function(){
			location.href = "http://jiawei1996.github.io/computer/" + this.id;
		})
	}

})();