// var text = document.getElementById("content").value;

// document.getElementById("result").innerHTML = html;
(function() {
	//$("#content").load("Chapter1_Introduction.md");
	// $(".latex").latex();
	// $(".latex").latex({
	// url: 'http://www.sitmo.com/gg/latex/latex2png.2.php?z=100&eq={e}'
	// });

	// $(".latex").latex({callback : function() {
	//                        this.css({border: '1px solid black'});
	//                    }                       
	// });
	$.get("／sources/academics/Chapter1_Introduction.md", function(result){

		var converter = new showdown.Converter();
		var html = converter.makeHtml(result);
	    $("div").html(html);
	  });
})();
