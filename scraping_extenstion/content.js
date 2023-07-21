let isFirst = true;
let socket = null;

let flag = false;
let count = 1;

let seed = '';

function main(event) {
    console.log('LIMBO STARTED');

    function initializeSocket() {

        if (socket?.readyState === WebSocket.OPEN) {
            socket.close();
            console.log('Connection closed');
        }
        
        socket = new WebSocket('ws://localhost:8080');

        socket.addEventListener('open', function(event) {
            console.log('Connected to server');
        });

    }

    function generateSeed(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async function decreaseAction( element ){
        element.click();
    }

    async function getResult(){

        const betResult = document.querySelector(".rocket-number span");
        const inputFields = document.querySelectorAll(".input-control input");
        
        // let reactProps = inputFields[0][Object.keys(inputFields[0]).filter(k => k.includes("Props"))[0]];
        // reactProps.onChange({target: { value: '123'}});
        
                
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    'amount' : inputFields[0].value,
                    'payout' : inputFields[1].value,
                    'result' : betResult.textContent,
                    'seed' : seed
                }
            ))
        } else {
            console.error('Socket is not open');
        }

        const betNumber = betResult.textContent;
        const betAmount = document.querySelectorAll('.button-group button');

        if ( parseFloat( betNumber ) < parseFloat( inputFields[1].value ) ){
            betAmount[1].click();
            count++;
        }
        else{
            if ( count > 1 ) {
                for ( var i = 0; i < count - 1; i++){
                    await decreaseAction(betAmount[0]);
                }
                count = 1;
            }
        }

        main();

    }

    function startBet() {

        const betButton = document.getElementsByClassName('bet-button');
        betButton[0].click();

        setTimeout( async function() {
            await getResult();
        }, 3000);
    }

    initializeSocket();

    if ( isFirst ) {

        seed = generateSeed( 24 );

        setTimeout(function() {
            startBet();
        }, 15000);

        isFirst = !isFirst;

    }
    else {
        setTimeout(function() {
            startBet();
        }, 2500);
    }
}
  
window.addEventListener('load', main, false);
console.log('LIMBO');