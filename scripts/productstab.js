/*$('#aaa').click(function(event){

          console.log("aaaaaaa clicked");

          chrome.runtime.sendMessage({type: "getProductsData"}, function(response) {

			  console.log(response.status);
		});

 });*/

function throwAlert(type,text){

   $('body').prepend('<div id="alertID" class="col-sm-12 alert '+type+' alert-dismissible" role="alert">\
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                    <span aria-hidden="true">&times;</span></button>\
                    <strong>Ooooppps!</strong> '+text+'</div>');

    setTimeout(function(){ 
            $('#alertID').remove();
    }, 4000);

}

$(function() {

  //First thing - read the data stores
  var asinTrackingDB = store.get('asinTrackingDB') ;

  if(asinTrackingDB == null){
    asinTrackingDB = [];
  }

  //here we initiate all the GUI with the data from the storageDB
  function asinTrackingDB_updateGUI(){

      $('.asin-row').remove();

      asinTrackingDB.forEach(function(obj,index){

          console.log("Adding ASIN to GUI : ",index);

          var asinHtmlId = 'id-' + obj.chosenAsin ;

          

          var $newPanel = $(".asin-row-template").clone();
              $newPanel.removeClass("asin-row-template");
              $newPanel.addClass("asin-row");
              $newPanel.find(".collapse").removeClass("in");
              $newPanel.find(".accordion-toggle").attr("href", "#" + asinHtmlId)
                  .text(obj.asinTitle);
              $newPanel.find(".panel-collapse").attr("id", asinHtmlId);
              $newPanel.find("img").attr('src',obj.asinImgUrl);
              $("#accordion").append($newPanel.fadeIn());


      });
  }

  //update GUI with all asins from DB
  asinTrackingDB_updateGUI();

  function asinTrackingDB_updateAll(){
        store.set('asinTrackingDB',asinTrackingDB);
  }


  var removeObjFromCollection = function(arr, attr, value) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i][attr] === value) {
            arr.splice(i,1);
            //console.log("Removed at index : ",i);
            //console.log("ASINs array : ",arr);
        }
    }
    return -1;
  }

  function asinTrackingDB_remove(asin){

        removeObjFromCollection(asinTrackingDB, 'chosenAsin', asin);
        asinTrackingDB_updateAll();
        asinTrackingDB_updateGUI();
      
  }

  function asinTrackingDB_add(asin,parentAsinStr,asinImgUrl,asinTitle){

        //check if asin already exist
        var foundAsin = _.find(asinTrackingDB, 'chosenAsin', asin)

        if(foundAsin != undefined){

          console.log("Found ASIN : ",foundAsin);

          throwAlert('alert-danger','Product already tracked by you !!!');

          return;

        }
        

        asinTrackingDB.push({ chosenAsin: asin,
                              parentAsin: parentAsinStr,
                              asinImgUrl: asinImgUrl,
                              asinTitle: asinTitle,
                              keywords: [],
                              chartData: {}});

        /*var $template = $(".asin-row-template");

        var asinHtmlId = 'id-' + asin ;

        var $newPanel = $template.clone();
              $newPanel.find(".collapse").removeClass("in");
              $newPanel.find(".accordion-toggle").attr("href", "#" + asinHtmlId)
                  .text(asinTitle);
              $newPanel.find(".panel-collapse").attr("id", asinHtmlId);
              $newPanel.find("img").attr('src',asinImgUrl);
              $("#accordion").append($newPanel.fadeIn());*/
         asinTrackingDB_updateGUI();

         asinTrackingDB_updateAll();

  }


  $('#myTabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
    
  // call the tablesorter plugin and apply the uitheme widget
  $("#researchTable").tablesorter({
    // this will apply the bootstrap theme if "uitheme" widget is included
    // the widgetOptions.uitheme is no longer required to be set
    theme : "bootstrap",

    widthFixed: true,

    headerTemplate : '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!

    // widget code contained in the jquery.tablesorter.widgets.js file
    // use the zebra stripe widget if you plan on hiding any rows (filter widget)
    widgets : [ "uitheme","columnSelector", "filter", "zebra" ,"output","stickyHeaders"],

    widgetOptions : {
      // using the default zebra striping class name, so it actually isn't included in the theme variable above
      // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
      zebra : ["even", "odd"],

      // reset filters button
      filter_reset : ".reset",

      // extra css class name (string or array) added to the filter element (input or select)
      filter_cssFilter: "form-control",

      output_headerRows    : true,        // output all header rows (multiple rows),

      output_delivery      : 'd', 

      output_saveFileName  : 'research_table.csv',



       // extra class name added to the sticky header row
       stickyHeaders: '',

            // number or jquery selector targeting the position:fixed element
       stickyHeaders_offset: 0,

            // added to table ID, if it exists
       stickyHeaders_cloneId: '-sticky',

            // trigger "resize" event on headers
       stickyHeaders_addResizeEvent: true,

            // if false and a caption exist, it won't be included in the sticky header
       stickyHeaders_includeCaption: true,

            // The zIndex of the stickyHeaders, allows the user to adjust this to their needs
       stickyHeaders_zIndex: 2,

            // jQuery selector or object to attach sticky header to
       stickyHeaders_attachTo: '.tab-content',//null,

            // jQuery selector or object to monitor horizontal scroll position (defaults: xScroll > attachTo > window)
       stickyHeaders_xScroll: null,

            // jQuery selector or object to monitor vertical scroll position (defaults: yScroll > attachTo > window)
       stickyHeaders_yScroll: null,


            // scroll table top into view after filtering
       stickyHeaders_filteredToTop: true
      // set the uitheme widget to use the bootstrap theme class names
      // this is no longer required, if theme is set
      // ,uitheme : "bootstrap"

    }
  });

    // call this function to copy the column selection code into the popover
      $.tablesorter.columnSelector.attachTo( $('.bootstrap-popup'), '#popover-target');

      $('#popover')
        .popover({
          placement: 'right',
          html: true, // required if content has HTML
          content: $('#popover-target')
        });
  /*.tablesorterPager({

    // target the pager markup - see the HTML block below
    container: $(".ts-pager"),

    // target the pager page select dropdown - choose a page
    cssGoto  : ".pagenum",

    // remove rows from the table to speed up the sort of large tables.
    // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
    removeRows: false,

    // output string - default is '{page}/{totalPages}';
    // possible variables: {page}, {totalPages}, {filteredPages}, {startRow}, {endRow}, {filteredRows} and {totalRows}
    output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'

  });*/


  $("#keywordsTable").tablesorter({
    // this will apply the bootstrap theme if "uitheme" widget is included
    // the widgetOptions.uitheme is no longer required to be set
    theme : "bootstrap",

    widthFixed: true,

    headerTemplate : '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!

    // widget code contained in the jquery.tablesorter.widgets.js file
    // use the zebra stripe widget if you plan on hiding any rows (filter widget)
    widgets : [ "uitheme", "filter", "zebra" ,"output","stickyHeaders"],

    widgetOptions : {
      // using the default zebra striping class name, so it actually isn't included in the theme variable above
      // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
      zebra : ["even", "odd"],

      // reset filters button
      filter_reset : ".reset",

      // extra css class name (string or array) added to the filter element (input or select)
      filter_cssFilter: "form-control",

      output_headerRows    : true,        // output all header rows (multiple rows),

      output_delivery      : 'd', 

      output_saveFileName  : 'keywords_table.csv',

       // extra class name added to the sticky header row
       stickyHeaders: '',

            // number or jquery selector targeting the position:fixed element
       stickyHeaders_offset: 0,

            // added to table ID, if it exists
       stickyHeaders_cloneId: '-sticky',

            // trigger "resize" event on headers
       stickyHeaders_addResizeEvent: true,

            // if false and a caption exist, it won't be included in the sticky header
       stickyHeaders_includeCaption: true,

            // The zIndex of the stickyHeaders, allows the user to adjust this to their needs
       stickyHeaders_zIndex: 2,

            // jQuery selector or object to attach sticky header to
       stickyHeaders_attachTo: null,

            // jQuery selector or object to monitor horizontal scroll position (defaults: xScroll > attachTo > window)
       stickyHeaders_xScroll: null,

            // jQuery selector or object to monitor vertical scroll position (defaults: yScroll > attachTo > window)
       stickyHeaders_yScroll: null,


            // scroll table top into view after filtering
       stickyHeaders_filteredToTop: true
      // set the uitheme widget to use the bootstrap theme class names
      // this is no longer required, if theme is set
      // ,uitheme : "bootstrap"

    }
  });

  $(".startTracking").click(function(event){

    console.log("clicked");

      
  });


  $(document).on('click', '.btn-add-research-keyword', function(e)
    {
        e.preventDefault();

        var controlForm = $('.controls form:first'),
            currentEntry = $(this).parents('.entry:first'),
            newEntry = $(currentEntry.clone()).appendTo(controlForm);

        newEntry.find('input').val('');
        controlForm.find('.entry:not(:last) .btn-add-research-keyword')
            .removeClass('btn-add-research-keyword').addClass('btn-remove-research-keyword')
            .removeClass('btn-success').addClass('btn-danger')
            .html('<span class="glyphicon glyphicon-minus"></span>');
    }).on('click', '.btn-remove-research-keyword', function(e)
    {
    $(this).parents('.entry:first').remove();

    e.preventDefault();
    return false;
  });

  $(".downloadResearch").click(function(event){

    console.log("clicked");

      $("#researchTable").trigger('outputTable');

      return false;
  });

  $(".downloadKeywords").click(function(event){

    console.log("clicked");

      $("#keywordsTable").trigger('outputTable');

      return false;
  });

   /* chrome.runtime.onMessage.addListener(

          function(request, sender, sendResponse) {
           
            if (request.type == "productsData"){

               console.log("got products data : " + request.content);

               //$("table tbody").append('<tr><td><a href="http://www.google.com">click me</a></td><td>Languages</td><td>female</td><td>'+request.content+'</td><td>37</td><td>67</td><td>54</td></tr>');
              
                // let the plugin know that we made a update, then the plugin will
                // automatically sort the table based on the header settings
                //$("table").trigger("update");

                 sendResponse({status : "OK"});

                //return false;
            }

      });*/

  var counter = 0;

  function delay(time) {
    return function () {
        console.log("Delaying");
        var ret = new $.Deferred();
        setTimeout(function () {
            ret.resolve();
        }, time);
        return ret;
    };
  }

  function median(SortedArr) { 
        
        var half = Math.floor(SortedArr.length/2); 
        if (SortedArr.length % 2) { 
          return SortedArr[half]; } 
        else { 
          return (SortedArr[half-1] + SortedArr[half]) / 2.0; 
        } 
  } 

  function isLocalStorageSupported(){

      if(typeof(Storage) !== "undefined") {

        return true;
    // Code for localStorage/sessionStorage.
      } 

      return false;
  }

  var marketplace = 'US';

  $('#marketPlaceSelect').on('change', function(){
     var selected = $('#marketPlaceSelect option:selected').val();
     marketplace = selected;
     //alert(selected);
  });

  var singleWordsObjects = [];

  $('#buildKeywords').click(function(event){

              var $table = $('#keywordsTable');

              var keywordsRes =  _.chain(singleWordsObjects)
                          .groupBy(function(t){return t.keyword})
                          .map(function(value, key) {
                              return [ _.reduce(value, function(result, currentObject) {

                                  var l1=result.firstLevelPriority;
                                  var l2=result.secondLevelPriority;

                                 
                                  if(currentObject.firstLevelPriority != 0){
                                      result.firstLevelPriorityCount = result.firstLevelPriorityCount+1;
                                      l1 =  (result.firstLevelPriority + currentObject.firstLevelPriority);
                                  }

                                  if(currentObject.secondLevelPriority != 0){
                                      result.secondLevelPriorityCount = result.secondLevelPriorityCount+1;
                                      l2 = (result.secondLevelPriority + currentObject.secondLevelPriority);
                                  }
                                  
                                  
                                  if(result.idx == value.length){

                                      if(result.firstLevelPriorityCount != 0){
                                        l1 = (result.firstLevelPriority + currentObject.firstLevelPriority)/result.firstLevelPriorityCount;//value.length;
                                      }

                                      if(result.secondLevelPriorityCount != 0){
                                        l2 = (result.secondLevelPriority + currentObject.secondLevelPriority)/result.secondLevelPriorityCount;//value.length;
                                      }
                                  }

                                  return {
                                      count: value.length,
                                      keyword: key,
                                      origKeywords: result.origKeywords + currentObject.origKeywords + ',',
                                      firstLevelPriority: l1,
                                      secondLevelPriority: l2,
                                      idx: result.idx + 1,
                                      firstLevelPriorityCount:result.firstLevelPriorityCount,
                                      secondLevelPriorityCount:result.secondLevelPriorityCount
                                  }
                              }, {
                                  firstLevelPriorityCount:0,
                                  secondLevelPriorityCount:0,
                                  idx:1,
                                  origKeywords:'',
                                  firstLevelPriority: 0,
                                  secondLevelPriority: 0
                              })];
                          })
                           .flatten()
                           .sortByOrder(['firstLevelPriority','secondLevelPriority','count'],['desc','desc','desc'])
                           .value()   



                 console.log(keywordsRes);


                 keywordsRes.forEach(function(obj,index){


                    $table.append('<tr><td>'+ (index+1) +'</td>\
                        <td>'+obj.keyword+'</td>\
                        <td>'+obj.count+'</td>\
                        <td>'+obj.firstLevelPriority+'</td>\
                        <td>'+obj.secondLevelPriority+'</td>\
                        </tr>');
                                       
                        // let the plugin know that we made a update, then the plugin will
                        // automatically sort the table based on the header settings
                        $table.trigger("update");

                        return false;


                 });

                 $('#myTabs a[href="#keywords-a"]').tab('show');
  });


  $('#run').click(function(event){

  		/* chrome.runtime.sendMessage({type: "getProductsData"}, function(response) {

			  console.log(response.status);

		});*/

    var mainKeywords = [];

    $('input[name^=fields]').each(function() {
        mainKeywords.push($(this).val());
    });

    
    var $table = $('#researchTable');

    var letters = ['',' ',' a',' b',' c',' d',' e',' f',' g',' h',' i',' j',' k',' l',' m',' n',' o',' p',' q',' r',' s',' t',' u',' v',' w',' x',' y',' z'];

    var connectionWords = ['',' for', ' with',' and', ' plus'];

    var buyerWords = ['best ', 'cheap ', 'cheapest ', 'discount ', 'expensive ','great ','inexpensive ','low cost ','new ','personalized ','unique ']
    
    var phrasesCounter = 1;

    var compUrls = [];

    var p1 = $.when(1); // empty promise


    for (var mainKeyword = 0; mainKeyword < mainKeywords.length; mainKeyword++) {

        for (var word = 0; word < connectionWords.length; word++) {

            var searchWord = mainKeywords[mainKeyword] + connectionWords[word];

            for (var letter = 0; letter < letters.length; letter++) {

                var searchTerm = searchWord +letters[letter] ;

                if (marketplace == 'US'){
                      compUrls.push(encodeURI('http://completion.amazon.com/search/complete?search-alias=aps&client=amazon-search-ui&mkt=1&q=' + searchTerm));
                }

                if (marketplace == 'UK'){
                      compUrls.push(encodeURI('http://completion.amazon.co.uk/search/complete?method=completion&mkt=3&client=amazon-search-ui&search-alias=aps&q=' + searchTerm));
                }
            }

            
        }
    }

    var numOfUrls = compUrls.length;

    var keywordsList = [];

    //First phase: collecting search phrases
    

    compUrls.forEach(function(myUrl,index){

    //$.each(compUrls,function(index,myUrl){

        p1 = p1.then(function(){

                      return $.getJSON( myUrl, function(data) {

                            console.log("1 data",data);

                            var phrases = data[1];

                            var categories = undefined;

                            if(data[2][0] != undefined){

                                categories = data[2][0]['nodes'];
                            }

                            console.log("categ : ",categories);

                            var isRootSuggestion = false;

                            phrases.forEach(function(phrase,index){

                                  //var searchUrl = encodeURI('http://www.amazon.com/s/ref=nb_sb_noss?field-keywords=' + phrase);

                                  //Check if root keyword and the priority in the search suggestion
                                  var keywordType = 'long-tail';
                                  var firstLevelPriority = 0;
                                  var secondLevelPriority = 0;

                                  for(var word = 0; word < mainKeywords.length; word++){

                                    if(phrase === mainKeywords[word]){
                                        keywordType = 'root';

                                        isRootSuggestion = true;
                                        
                                    } 
                                  }

                                  if(isRootSuggestion){
                                    firstLevelPriority = 1 - ((index+1)/phrases.length)+0.1//10-index;
                                  } else {
                                    secondLevelPriority = 1 - ((index+1)/phrases.length)+0.1//10-index;
                                  }

                                  console.log("phrase : ",phrase);

                                  console.log("length : ",phrases.length);

                                  console.log("firstLevelPriority : ",firstLevelPriority);

                                  console.log("secondLevelPriority : ",secondLevelPriority);


                                  keywordsList.push({
                                              counter : phrasesCounter++, 
                                              keywords : phrase,
                                              keywordsType: keywordType,
                                              category: 'all',
                                              firstLevelPriority: firstLevelPriority,
                                              secondLevelPriority: secondLevelPriority
                                          });


                                  if(keywordType == 'root' && categories != undefined){

                                      categories.forEach(function(category,index){

                                             keywordsList.push({
                                                  counter : phrasesCounter++, 
                                                  keywords : phrase,
                                                  keywordsType: keywordType,
                                                  category: category.alias,
                                                  firstLevelPriority: firstLevelPriority,
                                                  secondLevelPriority: secondLevelPriority
                                              });

                                      });

                                  }
                            
                            } );

                            var percentProgress = Math.floor((index+1)/numOfUrls*100);

                            $('#loading-message').css('display','block');

                            $('#loading-message').find('.progress-bar').attr('aria-valuenow',percentProgress).css('width',percentProgress+'%').html(percentProgress+'%');

                      }).fail(function(data) {
                          console.error("Can't get search info",data);

                      }).always(function() {           
                          console.log( "complete" );
                      });   

                    
            }).then(delay(1000));

      });  
         

    p1.then(function(){
      console.log('p1 done : ',keywordsList);

      $('#loading-message').find('.progress-bar').attr('aria-valuenow',0).css('width',0+'%').html(0+'%');

      var p2 = $.when(1); // empty promise

      var numOfObj = keywordsList.length;

        //Second phase: get keywords search page info
      keywordsList.forEach(function(termObj,index){

                p2 = p2.then(function(){

                          var domain = 'www.amazon.com';

                         if(marketplace == 'UK'){
                           domain = 'www.amazon.co.uk' ;
                         }

                          var searchUrl = encodeURI('http://'+domain+'/s/ref=nb_sb_noss?field-keywords='+termObj.keywords);

                          if(termObj.category != 'all'){
                            searchUrl = encodeURI('http://'+domain+'/s/ref=nb_sb_noss?url=search-alias='+termObj.category+'&field-keywords='+termObj.keywords);
                          }

                          termObj.searchUrl = searchUrl;

                          console.log("searchUrl : ",searchUrl);
                          return $.get(searchUrl,function(data){



                                          //Get number of results
                                          var resultsNumHtml = $(data).find('#s-result-count').html();

                                          if(resultsNumHtml != undefined){

                                              resultsNumHtml =  resultsNumHtml.replace(',','');

                                              var resultsNum = /([0-9]*)\s+[results|result]/.exec(resultsNumHtml);

                                              if(resultsNum == null){
                                                console.error('No Results Number, keywords : ',termObj.keywords);
                                                resultsNum = -1;
                                              } else {
                                                resultsNum = resultsNum[1];
                                              }

                                              console.log('resultsNum : '+ resultsNum);

                                              termObj.resultsNum = parseInt(resultsNum);

                                          } else {

                                              termObj.resultsNum = -1;

                                          }

                                          //Get prices data
                                          var priceHtml = $(data).find('.s-item-container').find('.a-link-normal').children('span.s-price');

                                          var allPrices = [];

                                          priceHtml.each(function(index,price){

                                              if(price.innerHTML != undefined){

                                                  var re = /.?([0-9][0-9]*.[0-9][0-9])/g ;

                                                  var tempPriceMatchNoHTML = price.innerHTML.match(re);

                                                  var matchNo = 0;

                                                  if(tempPriceMatchNoHTML != null){
                                                      matchNo = price.innerHTML.match(re).length;
                                                  }
                                          
                                                  //console.log("prices count : ",matchNo);

                                                  var priceString = re.exec(price.innerHTML);

                                                  if(matchNo > 1){

                                                    priceString = re.exec(price.innerHTML);

                                                  }
   
                                                  //console.log("price : ",priceString);

                                                  if(priceString != null){
                                                    allPrices.push(parseFloat(priceString[1]));
                                                  }

                                                  

                                              }

                                          });

                                          allPrices.sort(function(a, b){return b-a});

                                          termObj.priceMax = allPrices[0];

                                          var priceAvg = _.reduce(allPrices, function(memo, num) {
                                                            return memo + num;
                                                      }, 0) / (allPrices.length === 0 ? 1 : allPrices.length);

                                          console.log("all prices : ",allPrices,priceAvg);

                                          termObj.priceAvg = parseFloat(priceAvg.toFixed(2));

                                          var priceMed = median(allPrices);

                                          console.log("Price Median : ",priceMed);

                                          termObj.priceMed = parseFloat(priceMed.toFixed(2));

                                          //Get reviews number
                                          var reviewsNoHtml = $(data).find('.s-item-container').find('.a-row').find('a[href*="#customerReviews"]');

                                          //console.log("reviewsNoHtml : ",reviewsNoHtml);

                                          allReviews = [];

                                          reviewsNoHtml.each(function(index,revsNum){

                                              if(revsNum.innerHTML != undefined){

                                                  allReviews.push(parseInt(revsNum.innerHTML));

                                              }

                                          });

                                          termObj.reviewsMax = allReviews[0];

                                          var reviewsAvg = _.reduce(allReviews, function(memo, num) {
                                                            return memo + num;
                                                      }, 0) / (allReviews.length === 0 ? 1 : allReviews.length);

                                          console.log("all reviews : ",allReviews,reviewsAvg);

                                          termObj.reviewsAvg = parseFloat(reviewsAvg.toFixed(2));

                                          var reviewsMed = median(allReviews);

                                          console.log("Reviews Median : ",reviewsMed);

                                          termObj.reviewsMed = parseFloat(reviewsMed.toFixed(2));


                                          //Get reviews level
                                          var reviewsLevelHtml = $(data).find('.s-item-container').find('.a-row').find('.a-icon-star .a-icon-alt');

                                          //console.log("reviewsNoHtml : ",reviewsLevelHtml);

                                          allReviewsLevel = [];

                                          reviewsLevelHtml.each(function(index,revsLevel){

                                              if(revsLevel.innerHTML != undefined){

                                                  var re = /[0-9].[0-9]/ ;

                                                  var revsLevelString = re.exec(revsLevel.innerHTML );

                                                  //console.log(revsLevelString);

                                                  if(revsLevelString == null){

                                                    allReviewsLevel.push(0);

                                                  } else {

                                                    allReviewsLevel.push(parseFloat(revsLevelString[0]));

                                                  }

                                              }

                                          });

                                          var reviewsLevelAvg = _.reduce(allReviewsLevel, function(memo, num) {
                                                            return memo + num;
                                                      }, 0) / (allReviewsLevel.length === 0 ? 1 : allReviewsLevel.length);

                                          termObj.reviewsLevelAvg = parseFloat(reviewsLevelAvg.toFixed(2));


                                          //Get prime percent
                                          var allProductsList = $(data).find('.s-item-container');
                                          var productsNo = allProductsList.length ;

                                          var allPrimeList =  $(data).find('.s-item-container').find('.a-icon-prime');
                                          var primeNo = allPrimeList.length ;

                                          console.log("primeNo : ",primeNo);
                                          console.log("productsNo : ",productsNo);


                                          termObj.primePercent = parseFloat((primeNo/productsNo * 100).toFixed(2));

                                          console.log("Prime perc : ",termObj.primePercent );


                                          //Get keywords page Pics
                                          var picsHtml =  $(data).find('.s-item-container').find('.a-row').find('img[alt="Product Details"]');
                                          //console.log("picsHtml : ",picsHtml);

                                          allPics = [];

                                          picsHtml.each(function(index,picUrl){

                                              if(picUrl.src != undefined){

                                                  allPics.push(picUrl.src);

                                              }

                                          });

                                          termObj.pics = allPics;



                                          //Get Ads pics and number
                                          var adsPicsHtml =  $(data).find('.pa-ad-details').find('img[alt="Product Details"]');
                                          console.log("adsPicsHtml : ",adsPicsHtml);

                                          var allAdsPics = [];

                                          adsPicsHtml.each(function(index,adPicUrl){

                                              if(adPicUrl.src != undefined){

                                                  //console.log("adPicUrl.src : ",adPicUrl.src);

                                                  allAdsPics.push(adPicUrl.src);

                                              }

                                          });

                                          termObj.addPics = allAdsPics ;

                                          termObj.addPicsNo = allAdsPics.length;

                                          //Get the brand
                                          var brandHtml = $(data).find('.s-item-container').find('.a-row span.a-size-small.a-color-secondary:nth-child(2)');

                                          //console.log("brandHtml : ",brandHtml);

                                          var allBrands = [];

                                          brandHtml.each(function(index,brand){

                                              if(brand.innerHTML != undefined){
           
                                                  var re = /<\/span>/i ;

                                                  if(!re.test(brand.innerHTML)) {
                                                      //console.log("brand.innerHTML : ",brand.innerHTML);

                                                      if(brand.innerHTML !== 'More Buying Choices'){
                                                        allBrands.push({name : brand.innerHTML});
                                                      }
                                                      
                                                  }                                                 

                                              }

                                          });

                                           var sortedAllBrands =  _.chain(allBrands)
                                              .groupBy(function(t){return t.name})
                                              .map(function(value, key) {
                                                  return [ _.reduce(value, function(result, currentObject) {

                                                      return {
                                                          count: value.length,
                                                          keyword: key                             
                                                      }
                                                  }, {
                                                      
                                                  })];
                                              })
                                               .flatten()
                                               .sortByOrder(['count'],['desc'])
                                               .value()  

                                          termObj.allBrands = sortedAllBrands;



                                          var progressPerc = (index+1)/numOfObj*100;

                                          var percentProgress = Math.floor( progressPerc);

                                          $('#loading-message').find('.progress-bar').attr('aria-valuenow',percentProgress).css('width',percentProgress+'%').html(percentProgress+'%');


                                      }).fail(function(data) {
                                          console.error("Can't get search info",data);

                                      }).always(function() {           
                                          console.log( "search complete" );
                                      });             
                }).then(delay(1000));
        });


        p2.then(function(){

                console.log('p2 done : ',keywordsList);

                //Third phase: fill the table and flatten the keywords objects

                

                keywordsList.forEach(function(termObj,index){


                      termObj.keywords.split(" ").forEach(function(word){

                          singleWordsObjects.push({keyword:word, 
                                                  category:termObj.category,
                                                  firstLevelPriority:termObj.firstLevelPriority, 
                                                  secondLevelPriority: termObj.secondLevelPriority,
                                                  origKeywords : termObj.keywords});

                      });


                      var picsImgs = ''

                      for (var picIndex = 0; picIndex < termObj.pics.length; picIndex++) {

                          picsImgs += '<img src='+termObj.pics[picIndex]+' height="40" width="40"></img>';

                      }

                      var picsDiv = '<div style="width:200px">'+picsImgs+'</div>';


                      var adPicsImgs = ''

                      for (var picIndex = 0; picIndex < termObj.addPics.length; picIndex++) {

                          adPicsImgs += '<img src='+termObj.addPics[picIndex]+' height="40" width="40"></img>';

                      }

                      var adPicsDiv = '<div style="width:100px">'+adPicsImgs+'</div>';


                       var brands = ''

                      for (var brandIndex = 0; brandIndex < termObj.allBrands.length; brandIndex++) {

                          brands += '<span> | '+termObj.allBrands[brandIndex].keyword+' '+termObj.allBrands[brandIndex].count +'</span>';

                      }

                      var brandsDiv = '<div style="width:200px">'+brands+'</div>';

                      //console.log(termObj.allBrands);


                       $table.append('<tr><td>'+ termObj.counter +'</td>\
                        <td>'+picsDiv+'</td>\
                        <td>'+adPicsDiv+'</td>\
                        <td><a href="'+termObj.searchUrl+'" target="_blank">'+termObj.keywords+'</a></td>\
                        <td>'+termObj.keywordsType+'</td>\
                        <td>'+termObj.category+'</td>\
                        <td>'+termObj.firstLevelPriority+'</td>\
                        <td>'+termObj.secondLevelPriority+'</td>\
                        <td>'+termObj.resultsNum+'</td>\
                        <td>'+termObj.priceAvg+'</td>\
                        <td>'+termObj.priceMed+'</td>\
                        <td>'+termObj.priceMax+'</td>\
                        <td>'+'avg BSR'+'</td>\
                        <td>'+'med BSR'+'</td>\
                        <td>'+'max BSR'+'</td>\
                        <td>'+termObj.reviewsAvg+'</td>\
                        <td>'+termObj.reviewsMed+'</td>\
                        <td>'+termObj.reviewsMax+'</td>\
                        <td>'+termObj.reviewsLevelAvg+'</td>\
                        <td>'+termObj.primePercent+'</td>\
                        <td>'+termObj.addPicsNo+'</td>\
                        <td>'+brandsDiv+'</td>\
                        <td>'+'new sellers number'+'</td>\
                        </tr>');
                                       
                        // let the plugin know that we made a update, then the plugin will
                        // automatically sort the table based on the header settings
                        $table.trigger("update");

                        return false;
                });

                console.log(singleWordsObjects);

                
                $('#loading-message').css('display','none');

        },function(){
          console.log('Failed 2');
        });



      
    },function(){
      console.log('Failed 1');
    });

   

    //$.tablesorter.clearTableBody( $table[0] );

		//$("table tbody")
   

	});

    

    
    $("#addAsinData").on("click", function () {
        var asin = $('#parentAsinInput').val();

        var asinUrl = 'http://www.amazon.com/dp/' + asin;

        $.get(asinUrl,function(data){

                       
              var resultsNumHtml = data;

              var asinsStr = /"dimensionValuesDisplayData"\s*:\s*({.*})/.exec(data);

              if(asinsStr == null){
                asinsStr = '{"' +asin+'" : []}';
              } else {
                asinsStr = asinsStr[1];
              }

              asinsObj = JSON.parse(asinsStr);

              console.log("ASINs : ",asinsObj);

              var parentAsinStr = /"parentAsin"\s*:\s*"([a-zA-Z0-9]{2,})"/.exec(data);

              if(parentAsinStr == null){
                parentAsinStr = asin ;
              } else {
                parentAsinStr = parentAsinStr[1];
              }

              console.log("Parent ASIN : ",parentAsinStr);

              console.log("local storage : ",isLocalStorageSupported());


              var asinImgUrl = $(data).find('#imgTagWrapperId').find('img').attr('src');

              var asinTitle =  $(data).find('#productTitle').text();

              console.log("Asin Img URL : ",asinImgUrl);

              //var dec = window.atob(asinImgUrl.replace('data:image/jpeg;base64,',''));

              //console.log("Asin decoded Img URL : ",dec);


              asinTrackingDB_add(asin,parentAsinStr,asinImgUrl,asinTitle);

                                         
        }).fail(function(data) {
              console.error("Can't get search info",data);
              throwAlert('alert-danger','ASIN not exist in this marketplace !!!')

        }).always(function() {           
              console.log( "search complete" );
        });         


     
    });

    $(document).on('click', '.glyphicon-remove-circle', function () {

        var id = $(this).parent().parent().find('.panel-collapse').attr('id');
        console.log("ASIN ID : ",id);

        asinTrackingDB_remove(id.replace('id-',''));

        //$(this).parents('.panel').get(0).remove();
    });

});

