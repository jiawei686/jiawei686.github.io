// var text = document.getElementById("content").value;

// document.getElementById("result").innerHTML = html;

(function() {
	$(".article_lable").click(function() {
		$.get(this.innerHTML+".md", function(result){
			var converter = new showdown.Converter();
			var html = converter.makeHtml(result);
		    $("div").html(html);
		  });
	});
	
})();