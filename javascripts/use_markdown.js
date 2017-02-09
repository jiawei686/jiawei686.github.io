// var text = document.getElementById("content").value;

// document.getElementById("result").innerHTML = html;
 
(function() {
	//$(".article_content").hide();
	function()
	$("#navigation div").click(function() {
		$.get(this.innerHTML+".md", function(result){
			var converter = new showdown.Converter();
			var html = converter.makeHtml(result);
		    // document.getElementsByClassName("article_content")[0].innerHTML=html;
		    //$.parser.parse(html); 
		    $(".article_content").append(html);
		  });
	});

	$(".article_lable").click(function() {
		// $(".article_content").show();
		$("#" + this.innerHTML).css("display","block");
	});
	
})();