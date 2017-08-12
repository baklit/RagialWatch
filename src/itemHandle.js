const notifier = require('node-notifier');
var path = require("path")
var items = []

addButton = document.getElementById("add")
alertValue = document.getElementById("alertvalue")
listings = document.getElementById("Listings")
ragial = document.getElementById("ragial")
updateIndicator = document.getElementById("updatetime")

var hiddenIFrame = document.createElement("IFRAME")

hiddenIFrame.style.width = "0"
hiddenIFrame.style.height = "0"
hiddenIFrame.style.border = "0"
hiddenIFrame.style.border = "none"

body.appendChild(hiddenIFrame)

document.getElementsByTagName

addButton.onclick = () => {
    generateListing(ragial.contentDocument.URL)
}

function generateListing(url) {
    if (alertValue.value == ""){
        alertValue.style.webkitAnimationIterationCount = "1";
        alertValue.style.webkitAnimationName = ""
        alertValue.style.webkitAnimationDuration = "0.5s";

        setTimeout(function ()
        {
            alertValue.style.webkitAnimationName = "flash-red";
        }, 0.5);

        return
    }

    hiddenIFrame.src = url
    hiddenIFrame.addEventListener("load", extractListing)
}

function extractListing(){
    var ragialdoc = hiddenIFrame.contentDocument
    var iteminfo = ragialdoc.getElementsByClassName("mkt_left")[0]
    var itemName = iteminfo.getElementsByTagName("h1")[0].getElementsByTagName("a")[1].innerText
    var itemImageSrc = iteminfo.getElementsByTagName("h1")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0].src
    var itemURL = ragialdoc.URL

    var cheapestListing = ragialdoc.getElementById("selltable").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0]
    var date = cheapestListing.getElementsByTagName("td")[0].innerText.trim()
    var price = cheapestListing.getElementsByTagName("td")[2].innerText

    if (date != "Vending Now")
        price = "N/A"

    var listingDiv = document.createElement("DIV")
    listingDiv.setAttribute("class", "listing")
    listingDiv.innerHTML = `<img class="icon" src="` + itemImageSrc + `"> ` + itemName + ` C:` + price + ` Alert:` + parseInt(alertValue.value, 10).toLocaleString() + `z`

    var removing = false;

    listingDiv.onclick = () => {
        if (!removing)  
            ragial.src = itemURL
    }

    var removeButton = document.createElement("BUTTON")
    removeButton.setAttribute("class", "remove")
    removeButton.innerText="X"

    var ind = items.length

    items[ind] = {
        div : listingDiv,
        url : itemURL,
        name : itemName,
        alert: parseInt(alertValue.value),
        index: ind
    }

    removeButton.onclick = () => {
        removing = true
        listingDiv.remove()
        items[ind] = null
    }

    listings.appendChild(listingDiv)
    listingDiv.appendChild(removeButton)

    hiddenIFrame.removeEventListener("load", extractListing)

    updateListings(0)
}

var currentListing
var currentIndex
var currentName
var currentPrice


function updateListings(index){
    if (index == null) {
        index = 0
    }
    if (index < items.length) {
        if (items[index] == null){
            updateListings(index + 1)
            return
        }

        setTimeout(() => {
            currentIndex = index
            item = items[index]
            currentListing = item
            hiddenIFrame.src = item.url
            hiddenIFrame.addEventListener("load", updateListing)
        }, 2000)
    } else{
        var time = new Date();
        updateIndicator.innerHTML = "Latest price update " +  ("0" + time.getHours()).slice(-2)   + ":" + 
            ("0" + time.getMinutes()).slice(-2) + ":" + 
            ("0" + time.getSeconds()).slice(-2)

        console.log("Updated full list " +  ("0" + time.getHours()).slice(-2)   + ":" + 
            ("0" + time.getMinutes()).slice(-2) + ":" + 
            ("0" + time.getSeconds()).slice(-2))
    }
}

function updateListing(){
    var ragialdoc    = hiddenIFrame.contentDocument
    var iteminfo     = ragialdoc.getElementsByClassName("mkt_left")[0]
    var itemName     = iteminfo.getElementsByTagName("h1")[0].getElementsByTagName("a")[1].innerText
    var itemImageSrc = iteminfo.getElementsByTagName("h1")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0].src
    var itemURL      = ragialdoc.URL

    var cheapestListing = ragialdoc.getElementById("selltable").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0]
    var date            = cheapestListing.getElementsByTagName("td")[0].innerText.trim()
    var price           = cheapestListing.getElementsByTagName("td")[2].innerText

    if (date != "Vending Now"){
        price = "N/A"
    }else{
        if (parseInt(price.replace(/,/g, "")) < currentListing.alert){
            currentName = itemName
            currentPrice = price

            hiddenIFrame.src = cheapestListing.getElementsByTagName("td")[0].getElementsByTagName("a")[0].href
            setTimeout(notify, 1000)
        }
    }

    var listingDiv = currentListing.div
    listingDiv.innerHTML = `<img class="icon" src="` + itemImageSrc + `"> ` + itemName + ` C:` + price + ` Alert:` + currentListing.alert.toLocaleString() + `z`

    var removing = false;

    listingDiv.onclick = () => {
        if (!removing)  
            ragial.src = itemURL
    }

    var removeButton = document.createElement("BUTTON")
    removeButton.setAttribute("class", "remove")
    removeButton.innerText="X"
    var cl = currentListing

    removeButton.onclick = () => {
        removing = true
        listingDiv.remove()
        items[cl.index] = null
    }

    listingDiv.appendChild(removeButton)

    hiddenIFrame.removeEventListener("load", updateListing)
    updateListings(currentIndex + 1)
}

function notify(){
    var vendInfo = hiddenIFrame.contentDocument.getElementById("vend_info")
    var location = vendInfo.getElementsByTagName("dt")[3].getElementsByTagName("input")[0].value.slice(6)
    var shopname = hiddenIFrame.contentDocument.getElementsByTagName("h2")[0].innerText

    console.log("Notify  " + currentName + ` current price is ` + currentPrice + location)

     notifier.notify({
        title : currentName,
        icon: path.join(__dirname, 'assets/icons/64x64.png'),
        message : ` current price is ` + currentPrice + `\n` + shopname + `\n` + location,
        wait: true
    });
}

setInterval(updateListings, 60000)
