(function () {
	
	$(function(){
		new navi;
	})

	var navi = function(){
		this.click_home();
		this.click_code();
		this.click_about();
		this.click_version();
	}

	var p = navi.prototype;
	p.click_home = function(){
		$("#navigation div:eq(0)").click(function(){
			location.href = "jiawei1996.github.io";
		})
	}

	p.click_code = function(){
		$("#navigation div:eq(1)").click(function(){
			location.href = "index.html";
		})
	}

	p.click_about = function(){
		$("#navigation div:eq(3)").click(function(){
			location.href = "jiawei1996.github.io/about/about.html";
		})
	}

	p.click_version = function(){
		$("#navigation div:eq(4)").click(function(){
			location.href = "jiawei1996.github.io/version";
		})
	}

})();