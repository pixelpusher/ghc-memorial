
      // the Handlebars template for search results
      // load this only once.
      // see the $( ) load function below 
      var PeopleTemplate, PersonTemplate;


      // This version is different because it uses the HTTP GET variable (the
      // bit after the ? in the url) to search the database, so you can pass
      // in a single id to search for
      
      // this function extracts the variable names and values from a url
      // such as "http://blahbalh.com/somepage.html?param1=34&param2=blahblah"
      // which gives 'param1' with a value of '34'
      // and 'param2' with a value of 'blahblah'

      // taken from: http://stackoverflow.com/questions/439463/how-to-get-get-and-post-variables-with-jquery
        
      function getQueryParams(qs) {
          qs = qs.split("+").join(" ");
          var params = {},
              tokens,
              re = /[?&]?([^=]+)=([^&]*)/g;
          
          while (tokens = re.exec(qs)) {
              params[decodeURIComponent(tokens[1])]
                  = decodeURIComponent(tokens[2]);
          }

          return params;
        }
            
      //
      // this function returns the GET variables passed in via the url
      //
      var $_GET = getQueryParams(document.location.search);
            
      var id = parseInt($_GET['id'],10); // get the id, make sure it is a number!
            
      // check if id is a proper number (NaN means 'Not a Number')
      var idIsGood = !(id == undefined || isNaN(id)); 


      //
      // this function loads (or re-loads) everything from the database based on the search string.
      //
      function loadDatabase()
      {            
        var HTemplate;   // the Handlebars template for search results

        var query;  // this is what sheetrock will use to search the database
        
        var targetElem; // the html id to load into
        
        var searchstring = $("#search").val();  // the text in the search form textbox
           
        // for testing
        console.log("searching for:" + searchstring);

        // turn on loading div, will hide when this is complete
        $("#loading").css("display", "block");

        // this little function runs when the query is finished and loaded
        var finishedLoading = function() { 
                targetElem.css('display','block'); 
        };
        
        if (idIsGood)
        {
          //hide people div
          $('#people').css("display", "none");

          query = "select * where %id%="+id;
          targetElem = $('#person');
          HTemplate = PersonTemplate;
        }
        else
        {
          //hide person div
          $('#person').css("display", "none");
          // 
          // search by forenames for containing string
          //        
          query = "select %id%, %surname%, %forenames%, %cemeterymemorial% where %surname% contains '" + 
            searchstring + "' order by %surname% asc";

          targetElem = $('#people');

          HTemplate = PeopleTemplate;

          $('#next25').css('display', 'block');

          // remove all children elements from last search:
          // http://api.jquery.com/empty/
          $('#people').remove('.result');
          $('#person').remove('.result');
        }

        // Define spreadsheet URL.
        var mySpreadsheet = 'https://docs.google.com/spreadsheet/ccc?key=1qM3kEVwzSg9sgYVfhibaF5jQdiw3E40ZVtaukCZugX4#gid=0';

        console.log('loading');

        // Load an entire sheet.
        targetElem.sheetrock({
          url: mySpreadsheet,
          sql: query,                
          chunkSize: 25, // 300 rows
          headersOff: true,
          rowHandler: HTemplate,
          rowGroups: false,
          loading: $('#loading'),
          userCallback : finishedLoading
        });  
      }


      // set a function to run when the document is loaded
      $(function() {

        // the Handlebars template for search results.
        // load this only once.
        PeopleTemplate = Handlebars.compile($('#people-template').html());
        PersonTemplate = Handlebars.compile($('#person-template').html());

        $("#search").val("Search...");
      
        // When you click on the #search text box
        $("#search").focus(function(){
        
          // If the value is equal to "Search..."
          if($(this).val() == "Search...") {
              // remove all the text and the class of .empty
              $(this).val("");
          }
        });

        // if the 'submit' button is clicked, or enter is pushed
        $("#search-form").submit( function(e) 
        {
          e.preventDefault();

          // if there isn't anything in the box, don't search...
          if ($("#search").val()) 
          {
            idIsGood = false; // reset ID search
            loadDatabase();
          }
        }); 
      
        // if we've been passed an id string, load the results!
        if (idIsGood)
        {
          loadDatabase();
        }

      });