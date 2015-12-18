var Module = (function(my){

  var INTERVAL = 0;//0.2;
  var enabled = false;
  var itemsLength = 0;
  var productsMap = [];
  var $resultPopup;

  my.init = function() {
    console.log('content init');
    initMessageListener();
    appendExtensionElements();
    chrome.runtime.sendMessage({type: "getState"}, function(state) {
      enabled = state;
      if (enabled) {
        console.log("enabled : "+enabled);
        onloadHandler();
      }
      observerInit();
    });
  };


  function initMessageListener() {
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.type == "updateState"){
          console.log("update to enabled with data : "+request.data);
          enabled = request.data;
        }

        if (request.type == "getProductsData"){

           console.log("got products request");

           var rank = $('.extension-rank').length;

           console.log("sending rank : " + rank);

           sendResponse({status : "OK" , content : rank});

        }

      });
  }

  function appendExtensionElements(){
    appendPlayButton();
    appendPopup() ;
  }

  function appendPopup() {

    //var resultsPage = $('#resultsCol');

    //console.log(resultsPage);

    $resultPopup = $('<div id="extension-resultPopup" ><span style="color:#000000"><b>Loading ...</b></span></div>')
      .appendTo($('#resultsCol'))
      //.appendTo($('#atfResults'))
      .hide();
  }

  function appendPlayButton(){

    /*  var playButton = $('<button id="playSrearch"></button>');

      $('body').append(playButton);

      playButton.click(function(event){
         chrome.runtime.sendMessage({type: "openNewTab"}, function(status) {
                
                     console.log(status);

                 }); 
      });*/

      $('.shoppingEngineSectionHeaders').dblclick(function(event){

          chrome.runtime.sendMessage({type: "openNewTab"}, function(status) {
                
                     console.log(status);

                 }); 


      });


      /*playButton.click(function(){

        for(i=0;i<4;i++){
          $('#pagnNextLink')[0].dispatchEvent(new MouseEvent("click"));

        }

        

      });*/

      //$('<iframe width="800" height="800" src="http://www.amazon.com/Outsunny-Covered-Outdoor-Porch-Swing/dp/B00CULDS9C/ref=sr_1_1?s=lawn-garden&ie=UTF8&qid=1435604102&sr=1-1&keywords=outdoor+porch+swing+bed"></iframe>').insertBefore('body');
      //playButton.insertBefore('body');

      /*playButton.click(function(){

                    chrome.runtime.sendMessage({type: "test"}, function(status) {

                      console.log(status);
                    });

                  $.get('https://sellercentral.amazon.com/hz/fba/profitabilitycalculator/index?lang=en_US').done( function(calcData){

                      //sendResponse({status : "OK"});
                      // console.log(data);

                       var ttt = $(calcData).find('#search-form').find('input:first').attr('value');

                       console.log(ttt);

                       //ttt.insertBefore('body');

                  }).fail(function() {
                      //sendResponse({status : "Error"});

                       console.log(data);
                });


      });*/

  }

  function observerInit () {
    console.log("In observerInit()");

    var target = document.querySelector('#resultsCol');
    if(!target) target = document.querySelector('#zg_centerListWrapper');

    if (!enabled) return;

    var observer = new MutationObserver( function(mutations) {
      
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          var items = [];
          var targetClass = 's-result-item';
          var addedNodesLength = mutation.addedNodes.length;
          //console.log("addedNodesLength : " + addedNodesLength);
          if ( addedNodesLength === 1 ) {
            //console.log("=1");
            items = $(mutation.addedNodes[0]).find('.' + targetClass);
          }
          else if (addedNodesLength > 1) {
            //console.log(">1");
            $.each(mutation.addedNodes, function(i, node){
              if ($(node).hasClass(targetClass)) {
                items.push(node);

              }
            });
          }
          console.log("Going to process items");

          processItems(items);

          //console.log("Items num " + itemsLength);

          // console.log("Items ext lengt " +$('.extension-rank').length) ;


          if($('.'+targetClass).find('.extension-rank').length == itemsLength){

              console.log("Finished all products " + $('.extension-rank').length);

          }
            
        }
      });

    });

    var config = { subtree: true, childList: true, characterData: true };
    observer.observe(target, config);
  }


  function onloadHandler() {

    //$(document).ready(function(){
      console.log("In onloadHandler()");
      var items = $('.s-result-list > li');
                             
      if(items.length == 0) items = $('#zg_centerListWrapper > .zg_itemImmersion');
      //items = items == null ? $('.g-items-section > .g-item-sortable') : items ;
      itemsLength = items.length;
      //Run on search results 
      console.log("Items : ",items)

      processItems(items);

      
      //console.log("Finished all products " + $('.extension-rank').length);
    //});
  }

  function processItems(items) {

    console.log("In processItems(items)");

    for (var i = 0, len = items.length; i < len; i++) {
      processItem(items[i],  i*INTERVAL*1000);
      //console.log("Products length" + i);
    }
   // console.log("Finished all products " + $('.extension-rank').length);

  }


  function processItem(item, delay) {

    var $item = $(item);
    var links = $item.find('a');

    //if(links.length == 0) links = $item.find('.zg_itemImageImmersion > a');

    console.log("links : ",links);

    if (!links.length) return;
    var url = links[0].href;
    setTimeout( function(){

      $.get(url).done( function(data){
        
        var asin = $item.attr('data-asin') //url.split( '/' )[5] ;

        var productNameInUrl = url.split( '/' )[3];

        /*var searchTerm = $(data).find("#twotabsearchtextbox").val();

        priceRegex = /(\$|\£)[0-9,.]+/;
        currencyRegex = /((\$|\£))/g;

        var price = "N/A";
            price = $(data).find("#priceblock_ourprice.a-color-price").text();
            price = price.match(priceRegex) ? price.match(priceRegex)[0] : "N/A";
            price = price.replace(currencyRegex,"");//Take it just a number

      
        var brand = $(data).find("#brand").text();

        if(!brand){
          brand = "N/A";
        }*/

        var details = getDetails(data, url);
        if (!details) return;

        var whoInBuyBox = getMerchantInfo(data, url);

        //console.log("merchant info : " , whoInBuyBox.innerHTML);

        var rank = processRankDetails(details.innerHTML);


          //console.log("Rank : ",rank);
        
        //var merchantInfo = processMerchantInfoDetails(whoInBuyBox.innerHTML);
        var brandUrl = processBrand(whoInBuyBox.innerHTML);

        var sellersUrl = processSellers(whoInBuyBox);

        var $sibling = $item.find('.s-item-container');
       // if (!$sibling.length) $sibling = $item.find('.rsltR');
        if (!$sibling.length) $sibling = $item.find('.zg_itemWrapper');

        if (!$sibling.length) {
          console.log("I don't know where to put content: " + url);
          return;
        }

         //  console.log(rank);
        var tempRank = /(#.*\s+)\(/.exec(rank);

        
        if(tempRank == null){

          rank = /(\d+.*\s+)\(/.exec(rank);
        } else{
          rank = tempRank;
        }


        
        if (rank !== '' && rank !== null) {

          //console.log(rank[1]);

          rank = rank[1].replace(/([#\d,]+)\s+in/g, '<a href="#"><span class="extension-rank">$1</span></a> in');



          var rankElement = $('<div style="font-weight:bold;" class="extension-result">'  + rank + '</div>');//+'<hr>'+
                            //  '<div >' +merchantInfo+ '</div>' + '</div>');
         

          var cccAmzLocation = 'us';

          if(window.location.hostname == 'www.amazon.co.uk'){
            cccAmzLocation = 'uk';
          }

          if(window.location.hostname == 'www.amazon.de'){
            cccAmzLocation = 'de';
          }

          if(window.location.hostname == 'www.amazon.fr'){
            cccAmzLocation = 'fr';
          }

          if(window.location.hostname == 'www.amazon.co.jp'){
            cccAmzLocation = 'jp';
          }

          if(window.location.hostname == 'www.amazon.cn'){
            cccAmzLocation = 'cn';
          }



          var cccImageUrl = 'http://charts.camelcamelcamel.com/'+cccAmzLocation+'/'+asin+'/sales-rank.png?force=1&zero=0&w=725&h=440&legend=1&ilt=1&tp=all&fo=0&lang=en';

          var ccc  = $('<div><img src="'+cccImageUrl+'"></img></div>');

          var cccImagePriceUrl = 'http://charts.camelcamelcamel.com/'+cccAmzLocation+'/'+asin+'/amazon-new.png?force=1&zero=0&w=725&h=440&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=en';

          var cccPrice  = $('<div><img src="'+cccImagePriceUrl+'"></img></div>');

          var cccUrl = '#'

          if(productNameInUrl !== undefined){

                  cccUrl = 'http://'+cccAmzLocation+'.camelcamelcamel.com/' + productNameInUrl + '/product/' + asin ; 
          }

           var quickView = $('<div class="extension-result">\
                                <span style="font-weight:bold;">Quick View:</span>\
                                <a href="'+cccUrl+'" target="_blank"><span class="extension-ccc" >BSR History</span></a>\
                                 <span>|</span>\
                                <a href="'+cccUrl+'" target="_blank"><span class="extension-ccc-price" >Price History</span></a>\
                                 <span>|</span>\
                                <a href="'+brandUrl+'" target="_blank"><span class="extension-brand" >Brand</span></a>\
                            </div>');

          var asinView = $('<div id="extension-asin-view" class="extension-result">\
                                <span style="font-weight:bold;">ASIN: </span><span>'+asin+'</span>\
                            </div>');

          quickView.find('.extension-ccc').mouseenter(function(event){
            
            $resultPopup.show();
            $resultPopup.html(ccc);

            //console.log($resultPopup);

            chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-hover",label: "ccc-bsr"}, function(status) {
                
                //console.log(status);   
             
            });


          })
          .mouseleave(function(e){
            $resultPopup.html('').hide();
          });


           quickView.find('.extension-ccc').click(function(event){
            

                 chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-click",label: "ccc-bsr"}, function(status) {
                
                //console.log(status);

                 }); 

                
             
            });

           quickView.find('.extension-ccc-price').mouseenter(function(event){
            //console.log("cccccccc");
            $resultPopup.show();
            $resultPopup.html(cccPrice);

            //console.log($(event.target).text());

            chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-hover",label: "ccc-price"}, function(status) {
                
                //console.log(status);   
             
            });
          })
          .mouseleave(function(e){
            $resultPopup.html('').hide();
          });


        quickView.find('.extension-ccc-price').click(function(event){
            

            chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-click",label: "ccc-price"}, function(status) {
                
                //console.log(status);   

            });
             
        });
         

          rankElement.find('.extension-rank').mouseenter(function(event){
            $resultPopup.show();
            $resultPopup.html(details);

            //console.log($(event.target).text());

            chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-hover",label: "details"}, function(status) {
                
                //console.log(status);   
             
            });
          })
          .mouseleave(function(e){
            $resultPopup.html('').hide();
          });

          quickView.find('.extension-brand').mouseenter(function(event){

           // console.log("brandProducts : "+brandProducts);
               var brandProducts = '';

               $resultPopup.show(); 

               var date = new Date();
               var startMs = date.getTime();

               //console.log(brandUrl);

              $.get(brandUrl).done( function(data){

                    brandProducts = $(data).find('#s-results-list-atf'); 

                    if(brandProducts.length === 0){
                      brandProducts = $(data).find('#center'); 
                    }

                    //console.log(brandProducts);
                   
                    $resultPopup.html(brandProducts);  

                    date = new Date();
                    var endMs = date.getTime();

                    var loadTimeMs = endMs - startMs ;

                    //console.log(date,endMs,loadTimeMs);

                    chrome.runtime.sendMessage({type: "eventWithLabelAndValue",category: "quick-view",action:"mouse-hover",label: "brand",value: loadTimeMs}, function(status) {
                        
                        //console.log(status);   
                     
                    });          

              });
                 
          })
          .mouseleave(function(e){
            $resultPopup.html('').hide();
          });


        quickView.find('.extension-brand').click(function(event){

        
                chrome.runtime.sendMessage({type: "eventWithLabel",category: "quick-view",action:"mouse-click",label: "brand"}, function(status) {

                 });

          });
                 
     
          //var fbaCalcLink =  $('<div class="extension-result"><span>After FBA fees:&nbsp</span><a style="color:#b12704;font-weight:bold" id="fbaCalcLink">N/A</a></div>');
       
          //fbaCalcLink.insertAfter($sibling.find('.a-row > .a-column:first'));

                       console.log('hheerrr',$sibling);


          if($sibling.find('.a-row').length != 0){

            $sibling.find('.a-row').css('height','auto');
            asinView.insertAfter($sibling.find('.a-row > .a-column:first'));
            quickView.insertAfter($sibling.find('.a-row > .a-column:first'));
            rankElement.insertAfter($sibling.find('.a-row > .a-column:first'));
          } else if ($sibling != 0){

            //$sibling.find('.imageContainer').css('height','auto');
            asinView.insertAfter($sibling);
            quickView.insertAfter($sibling);
            rankElement.insertAfter($sibling);

          }

          //#result_0 > div.image.imageContainer > a > div

           //console.log('ASIN : ', asin , 'fba seller : ', sellersUrl );

           //var prime = $sibling.find('i.a-icon-prime');

          //console.log('prime : ', prime  );


          $.get(sellersUrl).done( function(sellersData){

            var amzSeller = $(sellersData).find('.olpSellerName').children('img');

            if(amzSeller.length == 1){
               //console.log(amzSeller.attr('src'));
                asinView.append('<span>|</span><span style="color:red;"> Sold by Amazon </span>');
                //asinView.css('background','#FF9966');//'url('+amzSeller.attr('src')+')').css('background-repeat','no-repeat');
            }

            var fbaSeller = $(sellersData).find('.olpDeliveryColumn').children('.olpBadgeContainer');

            if(sellersUrl === ''){ //only one fba seller

              var prime = $sibling.find('i.a-icon-prime');
              if(prime.length >= 1){
                fbaSeller.length = 1;
              }
              
            }

            if(fbaSeller.length > 0){

                 asinView.append('<span>|</span><span style="color:red;"> '+fbaSeller.length+' FBA Sellers</span>');

            }
            

         });

          /*var calcUrl = 'https://sellercentral.amazon.com/hz/fba/profitabilitycalculator/productmatches?searchKey='+asin+'&language=en_US&profitcalcToken=HQBV92QYmca3magnpRp8z0h3Ieoj3D';

          if(window.location.hostname == 'www.amazon.co.uk'){

                calcUrl = 'https://sellercentral.amazon.co.uk/hz/fba/profitabilitycalculator/productmatches?searchKey='+asin+'&language=en_GB&profitcalcToken=a1j2Fv0Sj2FO7COj2BijzoXJLmWRYj2FVrUj3D';

          }

          $.get(calcUrl).done( function(response){

              if(response.succeed == "true" && response.data.length === 1){

                 var tempPrice = /([0-9]+\.[0-9]+)/.exec($sibling.find('.a-row .s-price').text());

                 var price = parseFloat(tempPrice);

                 //console.log(price);

                 var marketPlaceId = "ATVPDKIKX0DER" ;
                 var currency = "USD";

                 if(window.location.hostname == 'www.amazon.co.uk'){
                    marketPlaceId = "A1F83G8C2ARO7P";
                    currency = "GBP";
                 }

                 var fbaCalcBody = {"afnPriceStr":price,
                                "mfnPriceStr": price,
                                "mfnShippingPriceStr": 0,
                                "currency": currency,
                                "marketPlaceId": marketPlaceId,
                                "hasFutureFee": false,
                                "futureFeeDate": "2015-05-05 00:00:00"};

              fbaCalcBody.productInfoMapping = response.data[0];

              //console.log(JSON.stringify(fbaCalcBody));

              var getFeesUrl = 'https://sellercentral.amazon.com/hz/fba/profitabilitycalculator/getafnfee' ;

              if(window.location.hostname == 'www.amazon.co.uk'){
                //console.log("in uk");
                getFeesUrl = 'https://sellercentral.amazon.co.uk/hz/fba/profitabilitycalculator/getafnfee';
              };

              jQuery.ajax({
                            url : getFeesUrl,
                            type: 'POST',
                            contentType: "application/json",
                            dataType : "json",
                            data:JSON.stringify(fbaCalcBody),
                            success:function(response2) { 
                              //console.log(asin);
                              //console.log(response2); 

                              var orderHandlingFee = response2.data.afnFees.orderHandlingFee;

                              if(response2.data.afnFees.orderHandlingFee == null){
                                orderHandlingFee = 0;
                              }

                              var fbaFees = response2.data.afnFees.fixedClosingFee +
                              orderHandlingFee  +
                              response2.data.afnFees.pickAndPackFee +
                              response2.data.afnFees.referralFee + 
                              response2.data.afnFees.storageFee +
                              response2.data.afnFees.variableClosingFee+
                              response2.data.afnFees.weightHandlingFee;

                              //console.log("aaaaa",price);

                              fbaCalcLink.find('#fbaCalcLink').text((price-fbaFees).toFixed(2));

                            },
                            error: function() {console.error('FBA Calc Failure'); }

                          }
                      );    

              }

               
           });*/
         
              
        }

      });

    }, delay);
  }


  function getDetails(html, url) {
    var $html = $(html);
    var details = $html.find('#detail-bullets .content')[0];
    if (!details) details = $html.find('#detailBullets')[0];
    if (!details) details = $html.find('#prodDetails')[0];
    if (!details) details = $html.find('#detail_bullets_id')[0];
    if (!details) details = $html.find('#productDetailsTable')[0];
    if (!details) {
      console.log('Details not found: ' + url);
      details = '';
    }
    return details;
  }

  function getMerchantInfo(html, url) {
    var $html = $(html);
    var details = $html.find('#centerCol')[0];
    
    if (!details) {
      console.log('getMerchantInfo not found: ' + url);
      details = '';
    }
    return details;
  }


  function processRankDetails(html) {

    if (!html) return '';
    var rankStr = $(html).find('#SalesRank').html();
    if (!rankStr) rankStr =  $(html).find("#productDetails_detailBullets_sections1 > tbody > tr > th:contains('Best Sellers Rank')").parent().find("td > span > span:nth-child(1)").html();
    if (!rankStr) rankStr = '';
    return rankStr;


  }

  function processMerchantInfoDetails(html){

    if (!html) return '';
    var infoStr = $(html).find('#merchant-info').html();
    if (!infoStr) infoStr = '';
    return infoStr;

  }

  function processBrand(html){

    if (!html) return '';
    var infoStr = $(html).find('#brand').attr('href');
    if (!infoStr) infoStr = '';
    //console.log(infoStr);
    
    return infoStr;

  }

  function processSellers(html){

    if (!html) return '';

    //var $html = $(html);

    var infoStr = $(html).find('#olp_feature_div a:first-of-type').attr('href');
    //infoStr = infoStr.find('a').attr('href');
    if (!infoStr) infoStr = '';
    //console.log(infoStr);
    
    return infoStr;

  }


  return my;

})(Module || {});


Module.init();
