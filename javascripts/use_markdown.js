// var text = document.getElementById("content").value;

// document.getElementById("result").innerHTML = html;
 
(function() {
	//$(".article_content").hide();
	$.get($(".article h2:eq(0)").attr("id")+".md", function(result){
		var converter = new showdown.Converter();
		var html = converter.makeHtml(result);
	    // document.getElementsByClassName("article_content")[0].innerHTML=html;
	    //$.parser.parse(html); 
	    $("#content").append(html);
	});
	
})();