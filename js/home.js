$(document).ready(function(){
    loadItems();
    
    $('#add-dollar').click(function (){
        var balance = parseFloat($("#balance-total").val());
        $("#balance-total").val(addCurrency(balance, 1.00));
        moneyAddedMessage(1.00);
        $('#balance-text').text($("#balance-total").val());
        balance = parseFloat($("#balance-total").val());
        if(balance > 0){
            turnOnConsoleLight($('#balance-text'));
        }
    })

    $('#add-quarter').click(function (){
        var balance = parseFloat($("#balance-total").val());
        $("#balance-total").val(addCurrency(balance, .25));
        moneyAddedMessage(.25);
        $('#balance-text').text($("#balance-total").val());
        balance = parseFloat($("#balance-total").val());
        if(balance > 0){
            turnOnConsoleLight($('#balance-text'));
        }
    })

    $('#add-dime').click(function (){
        var balance = parseFloat($("#balance-total").val());
        $("#balance-total").val(addCurrency(balance, .10));
        moneyAddedMessage(.10);
        $('#balance-text').text($("#balance-total").val());
        balance = parseFloat($("#balance-total").val());
        if(balance > 0){
            turnOnConsoleLight($('#balance-text'));
        }
    })

    $('#add-nickel').click(function (){
        var balance = parseFloat($("#balance-total").val());
        $("#balance-total").val(addCurrency(balance, .05));
        moneyAddedMessage(.05);
        $('#balance-text').text($("#balance-total").val());
        balance = parseFloat($("#balance-total").val());
        if(balance > 0){
            turnOnConsoleLight($('#balance-text'));
        }
    })

});
function loadItems(){
    clearItems();
    $.ajax({
        type: 'GET',
        url: 'http://tsg-vending.herokuapp.com/items',
        success: function(itemArray){
            $.each(itemArray, function(index, item){
                var itemsDiv = $('#items');
                if(item.quantity == 0){
                    var itemBox = '<a onClick="selectSoldOut(' + (index + 1) + ')" class="soldout-item-box" id="item-' + (index + 1) + '">';
                }else{
                    var itemBox = '<a onClick="selectItem(' + (index + 1) + ')" class="item-box" id="item-' + (index + 1) + '">';
                }
                itemBox = itemBox + '<div class="item-detail item-selection-number">SELECTION ID: ' + (index + 1) +'</div>';
                itemBox = itemBox + '<div class="item-detail item-name">' + item.name +'</div>';
                itemBox = itemBox + '<div class="item-detail item-price"> $' + item.price +'</div>';
                itemBox = itemBox + '<div class="item-detail item-quantity"> Available: ' + item.quantity+'</div>';
                itemBox = itemBox + '<input class="selection-id" type="hidden" value="' + (index + 1) +'">';
                itemBox = itemBox + '<input class="item-id" type="hidden" value="' + item.id +'">';
                itemBox = itemBox + '</a>';
                itemsDiv.append(itemBox);
            });
        },

        error: function (jqXHR, textStatus, errorThrown) {
            var responseText = JSON.parse(jqXHR.responseText);
            $('#error-message').text(responseText["message"]).show();
            
        } 
    });
}

function vendItem(){
    hideMessages();
    var id = $('#item-choice').val();
    var amount = $("#balance-total").val();

    $.ajax({
        type: 'POST',
        url: 'http://tsg-vending.herokuapp.com/money/' + amount + '/item/' + id,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'dateType': 'json',
        success: function(response){
            var quarters = response.quarters;
            var dimes = response.dimes;
            var nickels = response.nickels;
            var pennies = response.pennies;
            var totalChange = quarters + dimes + nickels + pennies;
                                         
            if(totalChange == 0){
                $('#change-message').text("NO CHANGE").show();
            }else{
                distributeChange(quarters, dimes, nickels, pennies);
            }   
            
            $('#enjoy-message').text('enjoy your purchase').show();
            resetBalance();
            resetSelection();

        },

        error: function (jqXHR, textStatus, errorThrown) {
            resetSelection();
            var responseText = JSON.parse(jqXHR.responseText);
            $('#error-message').text(responseText["message"]).show();
        } 
    });
}


function clearItems() {
    $("#items").children().remove();
}

function addCurrency(balance, currency){
    return (balance + currency).toFixed(2);
}

function hideMessages(){
    $('#welcome-message').text("").hide();
    $('#error-message').text("").hide();
    $('#enjoy-message').text("").hide();
    $('#selected-item').text("").hide();

}


function removeChange(){

    $('#change-message').text("").hide();
    $('#change-message').text("").hide();
    $('#total-quarters').text("").hide();
    $('#total-dimes').text("").hide();
    $('#total-nickels').text("").hide();
    $('#total-pennies').text("").hide();

}

function moneyAddedMessage(denomination){
    removeChange();
    $('#change-message').text('$' + denomination.toFixed(2) + ' Added to balance.').show();
}

function turnOnConsoleLight(element){
    $(element).removeClass('console-text deactivated-light');
    $(element).addClass('console-text activated-light');
}

function turnOffConsoleLight(element){
    $(element).removeClass('console-text activated-light');
    $(element).addClass('console-text deactivated-light');
}

function selectItem(selectionId){
    hideMessages();
    removeChange();
    var itemName = $('#item-' + selectionId).find('.item-name').text();
    var itemId = $('#item-' + selectionId).find('.item-id').val();
    $('#selected-item').text(itemName + ' SELECTED');
    $('#selected-item').show();
    $('#selection-id-number').text(selectionId);
    $('#item-choice').val(itemId)
    turnOnConsoleLight('#selection-id-number');
    turnOnConsoleLight('#selection-id-text');
}

function selectSoldOut(selectionId){
    hideMessages();
    resetSelection();
    removeChange();
    var itemName = $('#item-' + selectionId).find('.item-name').text();
    $('#error-message').text(itemName + ' SOLD OUT TRY AGAIN LATER').show();
}

function resetSelection(){
    turnOffConsoleLight('#selection-id-number');
    turnOffConsoleLight('#selection-id-text');
    $('#selection-id-number').text(0);
    $('#item-choice').val("");
}
function resetBalance(){
    turnOffConsoleLight('#balance-text');
    $('#balance-total').val("0.00");
    $('#balance-text').text($("#balance-total").val());
}

function returnChange(){

    var quarters = 0;
    var dimes = 0;
    var nickels = 0;
    var pennies = 0;
    var balance = $("#balance-total").val();

    while(balance >= .25){
        quarters += 1;
        balance -= .25;
    };
    while(balance < .25  && balance > .09 ){
        dimes += 1;
        balance -= .10;
    };
    while(balance < .10  && balance > .04){
        nickels += 1;
        balance -= .05;
    };
    while(balance < .05 && balance > 0){
        pennies += 1;
        balance -= .01;
    };
    distributeChange(quarters, dimes, nickels, pennies);
    resetBalance()
}

function distributeChange(quarters, dimes, nickels, pennies){
    removeChange();
    if(quarters > 0){
        $('#total-quarters').text("Quarters: " + quarters).show();
    }
    if(dimes > 0){
        $('#total-dimes').text("Dimes: " + dimes).show();
    }
    if(nickels > 0){
        $('#total-nickels').text("Nickels: " + nickels).show();  
    }              
    if(pennies > 0){
        $('#total-pennies').text("Quarters: " + pennies).show();    
    }
    
    $('#change-message').text("Please take your change").show();

    resetBalance();
}