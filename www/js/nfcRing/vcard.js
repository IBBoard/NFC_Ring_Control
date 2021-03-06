nfcRing.vcard = {};
nfcRing.vcard.cache = {};

// Search for a contact
nfcRing.vcard.search = function(name){
  $('#vCardResults').html(""); // Clear the results
  $('#vCardLoading').show(); // Show the loading screen
  $('#vCardNoResults').hide(); // Hide the vCardNoResults
  if(device.platform === "browser"){
    console.log("Simulating contact result as it's the browser");
    // TODO, review this formatting..
    nfcRing.vcard.found([
      {
        id: 1,
        name: "Awesome guy",
        displayName: "Testy McTesties",
        emails: [
          "john@mclear.co.uk", "chris@nfcring.com"
        ],
        phoneNumbers: [
          "07977654356","075358765336"
        ],
        addresses: [{
          formatted: "my home"
        }]
      },
      {
        id: 2,
        displayName: "Rob McTestingdom",
        name: "Rob Mc",
        pornStatus: "repair"
        /* TODO -- Add support for further contact properties */
      }
    ]);
  }else{
    var options = new ContactFindOptions();
    options.filter = name;
    options.multiple = true;
    var fields = ["*"]; // Gets all the user data
    navigator.contacts.find(fields, nfcRing.vcard.found, nfcRing.vcard.error, options);
  }
}

// When a contact is found write it to the UI
nfcRing.vcard.found = function(contacts){
  $('#vCardLoading').hide();
  console.log("Contact found", contacts);
  if(contacts.length === 0){ // If no contacts were found.
    $('#vCardResults').html("");
    $('#vCardNoResults').show();
  }else{
    $('#vCardNoResults').hide();
  }
  var i = 0;
  $('#vCardResults').html('<ul></ul>');
  $.each(contacts, function(k,person){
    if(person.displayName && person.id){
      if(i < 10){
        var displayItems = [];
        if(person.emails && person.emails.length > 0){
          displayItems.push("envelop");
        }
        if(person.phoneNumbers && person.phoneNumbers.length >0){
          displayItems.push("phone");
        }
        
        var displayItemsString = '';
        $.each(displayItems, function(k,v) {
          displayItemsString += '<i class="icon icon-'+v+'"></i>';
        })
        
        // Ensure we're not writing the same object ot the page again..
        if( $('#'+person.id).length === 0){
          $('#vCardResults ul').append('<li class="contact" id="'+person.id+'">'+person.displayName+ '<span class="indicators">' + displayItemsString+'</span></li>');
          nfcRing.vcard.cache[person.id] = person;
          i++;
        }
      }
    }
  });
}

nfcRing.vcard.showFields = function(){
  $("#vCardData").html("");
  $.each(nfcRing.userValues.contactToWrite, function(key, value){
    if(nfcRing.userValues.contactToWrite[key]){
      if(key !== "id" && key !== "rawId" && key !== "remove" && key !== "clone" && key !== "save" && key !== "photos" && key !== "displayName"){

        var upperKey = capitalizeFirstLetter(key);

        // TODO: There must be a better way to do this...
        if(key === "name"){
          value = value.formatted;
        }
        if(key === "emails"){
          upperKey = "Email";
          value = value[0].value;
        }
        if(key === "telephone" || key === "phoneNumbers"){
          value = value[0].value;
          upperKey = "Phone";
        }
        if(key === "addresses"){
          upperKey = "Address";
          value = value[0].formatted + "...";
        }
        if(typeof(value) === "object"){
          value = "....";
        }

        $("#vCardData").append('<div class="contactInfo"><label class="centered">' + upperKey + ': ' + value + '<input class="vCardCheckbox" type="checkbox" checked="checked" id="' + key + '" value="' + key + '" name="' + key + '"></label></div>');
      }
    }
  });
}

/*
$(document).on('click', '.contactInfo > label', function(){
  $(this).closest('.contactInfo').toggleClass('selected');
});
*/

// takes in contact card from cordova and builds vcard format
nfcRing.vcard.build = function(){
  var contact = nfcRing.userValues.contactToWrite;
  console.log("Which properties should I write?");
  var props = $('.vCardCheckbox:checked');
  console.log("props", props, "contact", contact);

  if(!props){
    alert("no properties selected, exiting");
    return;
  }

  var vCard = 'BEGIN:VCARD\n' +
   'VERSION:2.1\n';

  $.each(props, function(key, value){
    
    
    if(props[key].id === "name"){
      vCard += 'N:'+contact.name.familyName+';'+contact.name.givenName+';\n' + 
        'FN:'+contact.name.formatted+'\n';
    }

    if(props[key].id === "emails"){
      vCard += 'EMAIL;WORK:'+contact.emails[0].value+'\n';
    }

    if(props[key].id === "telephone" || props[key].id === "phoneNumbers"){
      vCard += 'TEL:'+contact.phoneNumbers[0].value+'\n';
    }

    if(props[key].id === "addresses"){
      var address = contact.addresses[0].formatted;
      address = address.replace("\n", ";");
      console.log("Address", address)
      vCard += 'ADR;WORK:'+address+'\n';
    }
   
   
  });

  vCard += 'END:VCARD';
  console.log("vCard", vCard);
  console.log("I AM HERE FOR SOME REASON!");
  nfcRing.userValues.isVCard = true;
  return vCard;
}

nfcRing.vcard.error = function(e){
  console.error("vCard Error", e);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
